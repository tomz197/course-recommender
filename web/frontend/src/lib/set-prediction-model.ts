import { storageController } from "@/storage";
import api from "./utils";

const getPredictionModels = async (): Promise<string[]> => {
  return (await api.get("/models")) as string[];
};

const setPredictionModel = async (rewrite: boolean = false): Promise<void> => {
  const model = storageController.getPredictionModel();
  if (model && !rewrite) {
    return;
  }

  const res = await getPredictionModels();
  storageController.setPredictionModel(res[Math.floor(Math.random() * res.length)]);
};

export { getPredictionModels, setPredictionModel };

