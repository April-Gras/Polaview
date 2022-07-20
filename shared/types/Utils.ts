export type NoId<T extends { id: number }> = Omit<T, "id">;
