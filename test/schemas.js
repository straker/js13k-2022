import { z } from '../node_modules/zod/lib/index.mjs';

export const ProjectileSchema = z
  .object({
    speed: z.number(),
    size: z.number(),
    damage: z.number(),
    ttl: z.number(),
    pierce: z.number(),
    update: z.function(),
    render: z.function()
  })
  .strict();

export const WeaponSchema = z
  .object({
    attackSpeed: z.number(),
    projectile: ProjectileSchema,
    spread: z.number(),
    numProjectiles: z.number()
  })
  .strict();

export const EnemySchema = z
  .object({
    speed: z.number(),
    size: z.number(),
    color: z.string().optional(),
    hp: z.number(),
    damage: z.number(),
    attackSpeed: z.number(),
    value: z.number(),
    behaviors: z.array(z.function())
  })
  .strict();

export const BehaviorSchema = z.function();

export const AbilitySchema = z
  .object({
    rarity: z.number(),
    text: z.string(),
    effect: z.function(),
    priority: z.number().optional()
  })
  .strict();
