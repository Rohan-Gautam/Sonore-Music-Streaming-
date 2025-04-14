declare module 'jsmediatags' {
    interface Picture {
        data: number[];
        format: string;
    }

    interface Tags {
        picture?: Picture;
        [key: string]: any;
    }

    interface TagType {
        tags: Tags;
    }

    interface ReadOptions {
        onSuccess: (tag: TagType) => void;
        onError: (error: Error) => void;
    }

    export function read(url: string, options: ReadOptions): void;
}