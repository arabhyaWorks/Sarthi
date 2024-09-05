import ffmpeg from "fluent-ffmpeg";


const convertOggToWav = async (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat("wav")
        .on("end", () => {
          console.log("Conversion to WAV successful");
          resolve(outputPath);
        })
        .on("error", (err) => {
          console.error("Error converting OGG to WAV:", err);
          reject(err);
        })
        .save(outputPath);
    });
  };

export default convertOggToWav;