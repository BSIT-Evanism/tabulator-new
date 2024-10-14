import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";
import { getSession } from "./session";

class MyCustomError extends Error { }

export const actionClient = createSafeActionClient({

    handleServerError(e) {
        // Log to console.
        console.error("Action error:", e.message);

        // In this case, we can use the 'MyCustomError` class to unmask errors
        // and return them with their actual messages to the client.
        if (e instanceof Error) {
            return e.message;
        }

        // Every other error that occurs will be masked with the default message.
        return DEFAULT_SERVER_ERROR_MESSAGE;
    },

});


export const protectedClient = actionClient.use(async ({ next }) => {
    const session = await getSession()

    if (!session.session) {
        throw new Error('Unauthorized')
    }

    return next({
        ctx: {
            user: session.session
        }
    })

})