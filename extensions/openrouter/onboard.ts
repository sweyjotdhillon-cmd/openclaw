// Openrouter setup module handles plugin onboarding behavior.
import {
  createAliasOnlyPresetAppliers,
  type OpenClawConfig,
} from "openclaw/plugin-sdk/provider-onboard";

export const OPENROUTER_DEFAULT_MODEL_REF = "openrouter/auto";

export function applyOpenrouterProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  return cfg;
}

export function applyOpenrouterConfig(cfg: OpenClawConfig): OpenClawConfig {
  return cfg;
}
