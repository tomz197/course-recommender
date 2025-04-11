import { storageController } from "@/storage";

const setPredictionModel = async (rewrite: boolean = false): Promise<void> => {
  const model = storageController.getPredictionModel();
  if (model && !rewrite) {
    return;
  }

  const res = (await fetch(
    import.meta.env.VITE_API_URL + "/models",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  ).then((res) => res.json())) as string[];

  console.log(res);

  storageController.setPredictionModel(res[Math.floor(Math.random() * res.length)]);
};

export default setPredictionModel;
