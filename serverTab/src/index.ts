// app/api/[[...slugs]]/route.ts
import { Elysia, t } from 'elysia'
import { Stream } from '@elysiajs/stream'
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';
import prisma from './db';
import { bearer } from '@elysiajs/bearer';
import { SwimwearSubCategory, FormalAttireSubCategory, QuestionAndAnswerSubCategory } from '@prisma/client'

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
  .listen(3002)

export type App = typeof app

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
