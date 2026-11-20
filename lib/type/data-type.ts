import { Who } from "@prisma/client";

export type contentGenerateType = {
  who: Who;
  content: string;
}[];

export type audioGenerateType = {
  id: string;
  who: string;
  content: string;
  audioUrl: string;
}[];

export type imageGenerateType = {
  who: Who;
  content: string;
  imageUrl: string;
}[];
