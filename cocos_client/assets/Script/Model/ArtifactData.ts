export default class ArtifactData {
    public artifactConfigId: string; // artifact config id
    public count: number; // count
    public addTimeStamp: number;

    public constructor(artifactConfigId: string, count: number) {
        this.artifactConfigId = artifactConfigId;
        this.count = count;
        this.addTimeStamp = 0;
    }
}


