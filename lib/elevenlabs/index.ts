import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";
import * as dotenv from "dotenv";

dotenv.config();

export const createAudioFileFromText = async (
  text: string,
): Promise<string> => {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is missing");
  }

  const voiceId = "sZUkQbT82d4SmH6xapFU";

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
      }),
    },
  );

  if (!response.ok) {
    const errorDetails = await response.text();

    console.error("========== ELEVENLABS API ERROR ==========");
    console.error("HTTP Status:", response.status);
    console.error("Response:", errorDetails);
    console.error("==========================================");

    throw new Error(`ElevenLabs HTTP ${response.status}: ${errorDetails}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());

  const publicFolderPath = path.join(
    process.cwd(),
    "public",
    "user-audio-generate",
  );

  await mkdir(publicFolderPath, { recursive: true });

  const fileName = `${uuid()}.mp3`;

  await writeFile(path.join(publicFolderPath, fileName), audioBuffer);

  return fileName;
};
