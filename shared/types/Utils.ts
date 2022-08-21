/**
 * Handy little type to remove the `id` field from a prisma interace.
 *
 * Or any interface for the mater.
 */
export type NoId<T extends { id: number }> = Omit<T, "id">;
