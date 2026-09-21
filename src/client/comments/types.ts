export interface CommentsOptions {
  el: HTMLElement;
  serverURL: string;
  path: string;
  lang: string;
}

export interface CommentsInstance { destroy(): void }
export interface CommentsAdapter { mount(options: CommentsOptions): CommentsInstance }
export type CommentsWindow = typeof window & { SyutoiComments?: Record<string, CommentsAdapter> };
