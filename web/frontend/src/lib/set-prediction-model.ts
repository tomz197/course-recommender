import { storageController } from "@/storage";
import api from "./utils";

const getPredictionModels = async (): Promise<string[]> => {
  const models = await api.get("/models") as string[];
  return [...models, "random"];
};

const getRandomModel = async (): Promise<string> => {
  const models = await getPredictionModels();
  const selected = models[Math.floor(Math.random() * models.length)];
  if (selected === "random") {
    return getRandomModel();
  }
  return selected;
}

const setPredictionModel = async (rewrite: boolean = false): Promise<void> => {
  const model = storageController.getPredictionModel();
  if (model && !rewrite) {
    return;
  }

  storageController.setPredictionModel("random");

  // const res = await getPredictionModels();
  // storageController.setPredictionModel(res[Math.floor(Math.random() * res.length)]);
};

export { getPredictionModels, setPredictionModel, getRandomModel };

