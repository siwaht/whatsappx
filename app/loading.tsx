export default function Loading() {
    return (
        <div className="flex h-[80vh] w-full items-center justify-center">
            <div className="relative flex h-10 w-10 items-center justify-center">
                <div className="absolute h-full w-full animate-ping rounded-full bg-primary/20 opacity-75"></div>
                <div className="relative h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        </div>
    );
}
