export type ScanDirectoryForEntitiesReturn = void;
export type ScanDirectoryForEntitiesData = {
  source: string;
  directory?: string;
};
type ScanDirectoryForEntities = (
  data: ScanDirectoryForEntitiesData
) => Promise<ScanDirectoryForEntitiesReturn>;
