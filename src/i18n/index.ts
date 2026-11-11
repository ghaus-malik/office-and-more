import { useCallback } from 'react'
import { useStore } from '@/store'
import { fr } from './fr'
import { en } from './en'

export type Lang = 'fr' | 'en'
export type Dict = typeof fr

type Leaf = string | readonly string[]
type Paths<T> = {
  [K in keyof T & string]: T[K] extends Leaf ? K : `${K}.${Paths<T[K]>}`
}[keyof T & string]
type ListPaths<T> = {
  [K in keyof T & string]: T[K] extends readonly string[] ? K : T[K] extends string ? never : `${K}.${ListPaths<T[K]>}`
}[keyof T & string]

export type TKey = Paths<Dict>
export type TListKey = ListPaths<Dict>
export type TParams = Record<string, string | number>

const dicts: Record<Lang, Dict> = { fr, en }

function lookup(dict: Dict, key: string): unknown {
  let cur: any = dict
  for (const part of key.split('.')) {
    cur = cur?.[part]
    if (cur === undefined) return undefined
  }
  return cur
}

export function translate(lang: Lang, key: TKey | string, params?: TParams): string {
  let s = lookup(dicts[lang], key)
  if (typeof s !== 'string') s = lookup(dicts.fr, key)
  if (typeof s !== 'string') {
    if (import.meta.env.DEV) console.warn(`[i18n] missing key: ${key}`)
    return key
  }
  return params ? (s as string).replace(/\{(\w+)\}/g, (_, k) => (k in params ? String(params[k]) : `{${k}}`)) : (s as string)
}

export function translateList(lang: Lang, key: TListKey): string[] {
  const v = lookup(dicts[lang], key)
  return Array.isArray(v) ? (v as string[]) : []
}

export function useT() {
  const lang = useStore((s) => s.lang)
  const setLang = useStore((s) => s.setLang)
  const t = useCallback((key: TKey, params?: TParams) => translate(lang, key, params), [lang])
  const tl = useCallback((key: TListKey) => translateList(lang, key), [lang])
  /** Translate a dynamic key built at runtime (e.g. from a status value). */
  const td = useCallback((key: string, params?: TParams) => translate(lang, key, params), [lang])
  return { t, tl, td, lang, setLang }
}
