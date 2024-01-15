import NodeCache from "node-cache";

const myCache = new NodeCache({ stdTTL: 3600 });

export default myCache;
