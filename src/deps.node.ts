import type { Context, NextFunction, Transformer } from "grammy";

export type {
    Context,
    NextFunction,
    Transformer,
  };
  
  export type MessageEntity = NonNullable<NonNullable<Parameters<Context["reply"]>[1]>["entities"]>[number];
  export type ParseMode = NonNullable<NonNullable<Parameters<Context["reply"]>[1]>["parse_mode"]>;