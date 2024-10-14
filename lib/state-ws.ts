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

    // actions
    setState: (state: State) => void;
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

        setState: (state) => {
            ws?.send({ type: "setState", state });
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
            });


            set({ status: "CONNECTED" });
        },

        disconnect: () => {
            ws?.close();
            ws = null;
            set({ status: "DISCONNECTED", currentState: null });
        },

        isConnected: () => get().status === "CONNECTED",
    };
});
