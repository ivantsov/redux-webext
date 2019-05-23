declare var chrome: {
    runtime: {
        connect: (options: {name: string}) => Connection,
        sendMessage: (
            msg: any,
            cb?: (res: Object) => void
        ) => void,
        onConnect: {
            addListener: (handler: (connection: Connection) => void) => void
        },
        onMessage: {
            addListener: (handler: (
                msg: Object,
                sender: ?string,
                cb: (res: any) => void
            ) => ?boolean) => void
        },
        onDisconnect: {
            addListener: (handler: () => ?boolean) => void
        }
    }
};
