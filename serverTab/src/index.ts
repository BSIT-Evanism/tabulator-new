// app/api/[[...slugs]]/route.ts
import { Elysia, t } from 'elysia'
import { Stream } from '@elysiajs/stream'
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';
import prisma from './db';
import { bearer } from '@elysiajs/bearer';
import { SwimwearSubCategory, FormalAttireSubCategory, QuestionAndAnswerSubCategory, FinalRoundSubCategory } from '@prisma/client'

const stateStream = new Stream();

enum State {
  swimwear = "swimwear",
  formalAttire = "formalAttire",
  questionAndAnswer = "questionAndAnswer",
  finalRound = "finalRound"
}

const app = new Elysia({ prefix: '/api' })
  .use(cors())
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET!,
    exp: '1d'
  }))
  .use(bearer())
  .use(swagger())
  .get('/', () => 'hello Next')
  .post('/generate-token', async ({ jwt, body }) => {
    const token = await jwt.sign({
      id: body.id,
      role: body.role
    })

    return {
      token
    }
  }, {
    body: t.Object({
      id: t.String(),
      role: t.String()
    }),
    response: t.Object({
      token: t.String()
    })
  })
  .get('/verify', async ({ jwt, query }) => {
    const session = await jwt.verify(query.token)

    if (!session) {
      return {
        session: null
      }
    }

    return {
      session: {
        id: session.id,
        role: session.role,
        exp: session.exp
      }
    }
  }, {
    query: t.Object({
      token: t.String()
    }),
    response: t.Object({
      session: t.Union([
        t.Object({
          id: t.Union([t.String(), t.Number()]),
          role: t.Union([t.String(), t.Number()]),
          exp: t.Union([t.Number(), t.Undefined()])
        }),
        t.Null()
      ])
    })
  })
  .get('/stream-state', () => {
    return stateStream
  })
  .post("/trigger-state/:state", ({ params }) => {
    stateStream.send(params.state)
    return params.state
  }, {
    params: t.Object({
      state: t.Enum(State)
    })
  })
  .ws("/wsstate", {
    body: t.Object({
      type: t.String(),
      state: t.Optional(t.String()),
    }),
    response: t.Object({
      type: t.String(),
      state: t.Optional(t.String()),
    }),
    open: async (ws) => {
      // You can add authentication check here if needed
      const state = await prisma.pageantState.findFirst({
        where: {
          id: 1
        }
      })
      ws.subscribe("stateChannel");
      ws.publish("stateChannel", {
        type: "stateUpdate",
        state: state?.state
      });
      ws.send({
        type: "stateUpdate",
        state: state?.state
      })
    },
    message: async (ws, payload): Promise<void> => {
      if (payload.type === "setState") {
        // Update the state and broadcast to all clients
        try {
          const state = await prisma.pageantState.update({
            where: {
              id: 1
            },
            data: {
              state: payload.state as State
            }
          })
          ws.publish("stateChannel", {
            type: "stateUpdate",
            state: payload.state,
          });
          ws.send({
            type: "stateUpdate",
            state: payload.state,
          })
        } catch (_) {
          const state = await prisma.pageantState.findUnique({
            where: {
              id: 1
            }
          })
          ws.publish("stateChannel", {
            type: "stateUpdate",
            state: state?.state
          });
        }
      }
    },
    close: () => {
      console.log("WebSocket closed");
    }
  })
  .get("/logged-in-judges", async () => {
    const judges = await prisma.judge.findMany({
      select: { id: true, name: true, isLoggedIn: true }
    })
    return judges
  }, {
    response: t.Array(t.Object({
      id: t.String(),
      name: t.String(),
      isLoggedIn: t.Boolean()
    }))
  })
  .get("/scores/:category", async ({ params, query }) => {
    const { category } = params;
    const { judgeId } = query;

    if (!judgeId) {
      throw new Error('judgeId is required');
    }

    let scores;
    switch (category) {
      case 'swimwear':
        scores = await prisma.swimwearScores.findMany({
          where: { judgeId: judgeId as string }
        });
        break;
      case 'formalAttire':
        scores = await prisma.formalAttireScores.findMany({
          where: { judgeId: judgeId as string }
        });
        break;
      case 'questionAndAnswer':
        scores = await prisma.questionAndAnswerScores.findMany({
          where: { judgeId: judgeId as string }
        });
        break;
      default:
        throw new Error('Invalid category');
    }

    return {
      scores: scores.map(score => ({
        ...score,
        id: score.id.toString()
      }))
    };
  }, {
    params: t.Object({
      category: t.Enum({ swimwear: 'swimwear', formalAttire: 'formalAttire', questionAndAnswer: 'questionAndAnswer' })
    }),
    query: t.Object({
      judgeId: t.String()
    }),
    response: t.Object({
      scores: t.Array(t.Object({
        id: t.String(),
        judgeId: t.String(),
        contestantId: t.String(),
        score: t.Number(),
        subCategory: t.Union([
          t.Enum(SwimwearSubCategory),
          t.Enum(FormalAttireSubCategory),
          t.Enum(QuestionAndAnswerSubCategory)
        ])
      }))
    })
  })
  .get("/topcontestants", async () => {
    const contestants = await prisma.contestant.findMany()
    const judges = await prisma.judge.findMany()

    const [swimwearScores, formalAttireScores, questionAndAnswerScores, finalRoundScores] = await Promise.all([
      prisma.swimwearScores.findMany({ include: { Contestant: true, Judge: true } }),
      prisma.formalAttireScores.findMany({ include: { Contestant: true, Judge: true } }),
      prisma.questionAndAnswerScores.findMany({ include: { Contestant: true, Judge: true } }),
      prisma.finalRoundScores.findMany({ include: { Contestant: true, Judge: true } })
    ])

    const calculateAverage = (scores: number[]) =>
      scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

    const organizedScores = contestants.map(contestant => {
      const contestantScores = {
        swimwear: swimwearScores.filter(s => s.contestantId === contestant.id),
        formalAttire: formalAttireScores.filter(s => s.contestantId === contestant.id),
        questionAndAnswer: questionAndAnswerScores.filter(s => s.contestantId === contestant.id),
        finalRound: finalRoundScores.filter(s => s.contestantId === contestant.id)
      }

      const categories = [
        {
          name: "Swimwear",
          subCategories: Object.values(SwimwearSubCategory).map(subCategory => ({
            name: subCategory,
            judgeScores: judges.map(judge => ({
              judge,
              score: contestantScores.swimwear.find(s => s.subCategory === subCategory && s.judgeId === judge.id)?.score || 0
            })),
            average: calculateAverage(contestantScores.swimwear.filter(s => s.subCategory === subCategory).map(s => s.score))
          })),
          average: calculateAverage(contestantScores.swimwear.map(s => s.score))
        },
        {
          name: "Formal Attire",
          subCategories: Object.values(FormalAttireSubCategory).map(subCategory => ({
            name: subCategory,
            judgeScores: judges.map(judge => ({
              judge,
              score: contestantScores.formalAttire.find(s => s.subCategory === subCategory && s.judgeId === judge.id)?.score || 0
            })),
            average: calculateAverage(contestantScores.formalAttire.filter(s => s.subCategory === subCategory).map(s => s.score))
          })),
          average: calculateAverage(contestantScores.formalAttire.map(s => s.score))
        },
        {
          name: "Question and Answer",
          subCategories: Object.values(QuestionAndAnswerSubCategory).map(subCategory => ({
            name: subCategory,
            judgeScores: judges.map(judge => ({
              judge,
              score: contestantScores.questionAndAnswer.find(s => s.subCategory === subCategory && s.judgeId === judge.id)?.score || 0
            })),
            average: calculateAverage(contestantScores.questionAndAnswer.filter(s => s.subCategory === subCategory).map(s => s.score))
          })),
          average: calculateAverage(contestantScores.questionAndAnswer.map(s => s.score))
        },
        {
          name: "Final Round",
          subCategories: Object.values(FinalRoundSubCategory).map(subCategory => ({
            name: subCategory,
            judgeScores: judges.map(judge => ({
              judge,
              score: contestantScores.finalRound.find(s => s.subCategory === subCategory && s.judgeId === judge.id)?.score || 0
            })),
            average: calculateAverage(contestantScores.finalRound.filter(s => s.subCategory === subCategory).map(s => s.score))
          })),
          average: calculateAverage(contestantScores.finalRound.map(s => s.score))
        }
      ]

      const overallAverage = calculateAverage([
        ...contestantScores.swimwear,
        ...contestantScores.formalAttire,
        ...contestantScores.questionAndAnswer,
        ...contestantScores.finalRound
      ].map(s => s.score))

      return { contestant, categories, overallAverage }
    })

    // Separate contestants by gender
    const maleContestants = organizedScores.filter(score => score.contestant.gender === 'MALE')
    const femaleContestants = organizedScores.filter(score => score.contestant.gender === 'FEMALE')

    const maxFinalist = await prisma.pageantState.findFirst({
      where: {
        id: 1
      }
    })

    // Sort each group separately
    const topMales = maleContestants.sort((a, b) => b.overallAverage - a.overallAverage).slice(0, maxFinalist?.maxFinalist ?? 3)
    const topFemales = femaleContestants.sort((a, b) => b.overallAverage - a.overallAverage).slice(0, maxFinalist?.maxFinalist ?? 3)

    return { topMales, topFemales }
  }, {
    response: t.Object({
      topFemales: t.Array(t.Object({
        contestant: t.Object({
          id: t.String(),
          name: t.String(),
          gender: t.String()
        })
      })),
      topMales: t.Array(t.Object({
        contestant: t.Object({
          id: t.String(),
          name: t.String(),
          gender: t.String()
        })
      }))
    })
  })
  .listen(3002)

export type App = typeof app

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
