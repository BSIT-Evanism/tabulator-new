import { create } from "zustand";
import { client } from "./treaty";

enum State {
    swimwear = "swimwear",
    formalAttire = "formalAttire",
    questionAndAnswer = "questionAndAnswer",
    finalRound = "finalRound"
}

export type StateStore = {
    currentState: State | null;
    status: "CONNECTED" | "DISCONNECTED";
    isLocked: boolean;
    // actions
    setState: (state: State) => void;
    setLock: (isLocked: boolean) => void;
    connect: () => void;
    disconnect: () => void;
    isConnected: () => boolean;
};

export const useStateStore = create<StateStore>((set, get) => {
    const { api } = client;
    type StateWS = ReturnType<(typeof api)["wsstate"]["subscribe"]>;
    let ws: StateWS | null = null;

    return {
        currentState: null,
        status: "DISCONNECTED",
        judges: [],
        isLocked: false,

        setState: (state) => {
            ws?.send({ type: "setState", state });
        },
        setLock: (isLocked) => {
            ws?.send({ type: "setLock", isLocked });
        },



        connect: () => {
            if (ws) get().disconnect();

            ws = api.wsstate.subscribe();

            ws.on("message", ({ data }) => {
                if (typeof data === 'object' && data.type === "stateUpdate") {
                    set({ currentState: data.state as State });
                } else {
                    console.error('Received unexpected data:', data);
                }
                if (typeof data === 'object' && data.type === "lockUpdate") {
                    set({ isLocked: data.isLocked });
                } else {
                    console.error('Received unexpected data:', data);
                }
            });


            set({ status: "CONNECTED" });
        },

        disconnect: () => {
            ws?.close();
            ws = null;
            set({ status: "DISCONNECTED", currentState: null, isLocked: false });
        },

        isConnected: () => get().status === "CONNECTED",
    };
});
