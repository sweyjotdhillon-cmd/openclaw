import { html, nothing, type TemplateResult } from "lit";
import { icons } from "../../components/icons.ts";

export type LocalLmEngine = "ollama" | "lmstudio" | "vllm" | "llama-cpp" | "sglang" | "custom-openai";

export type LocalLmPreset = {
  id: string;
  name: string;
  family: string;
  defaultModelId: string;
  engine: LocalLmEngine;
  defaultBaseUrl: string;
  description: string;
};

export const LOCAL_LM_PRESETS: Record<string, LocalLmPreset> = {
  kkimi: {
    id: "kkimi",
    name: "Kimi (Kkimi / Moonshot OS)",
    family: "kimi",
    defaultModelId: "kimi-k2.5-instruct",
    engine: "ollama",
    defaultBaseUrl: "http://localhost:11434/v1",
    description: "Kimi / Kkimi open-weights instruction model running on local inference engine.",
  },
  minimax: {
    id: "minimax",
    name: "MiniMax (MiniMax-M2.7 / MiniMax-Text)",
    family: "minimax",
    defaultModelId: "minimax-m2.7-local",
    engine: "lmstudio",
    defaultBaseUrl: "http://localhost:1234/v1",
    description: "MiniMax open-weights conversational LLM running locally.",
  },
  gamma: {
    id: "gamma",
    name: "Gamma (Gemma 3 / Gamma OS)",
    family: "gamma",
    defaultModelId: "gemma-3-27b-it",
    engine: "vllm",
    defaultBaseUrl: "http://localhost:8000/v1",
    description: "Gamma / Gemma 3 open-source model running via local vLLM / llama.cpp engine.",
  },
  quan: {
    id: "quan",
    name: "Quan (Qwen 2.5 / Quan OS)",
    family: "qwen",
    defaultModelId: "qwen2.5-72b-instruct",
    engine: "ollama",
    defaultBaseUrl: "http://localhost:11434/v1",
    description: "Quan / Qwen 2.5 high-performance open-source model.",
  },
  llama: {
    id: "llama",
    name: "Llama 3.3 (Meta Llama OS)",
    family: "llama",
    defaultModelId: "llama-3.3-70b-instruct",
    engine: "lmstudio",
    defaultBaseUrl: "http://localhost:1234/v1",
    description: "Meta Llama 3.3 open-weights model hosted locally.",
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek (DeepSeek V3 / R1)",
    family: "deepseek",
    defaultModelId: "deepseek-r1-distill-qwen-32b",
    engine: "ollama",
    defaultBaseUrl: "http://localhost:11434/v1",
    description: "DeepSeek R1 / V3 local reasoning and coding model.",
  },
};

export type LocalLmDashboardState = {
  selectedPresetKey: string;
  engine: LocalLmEngine;
  baseUrl: string;
  modelId: string;
  testing: boolean;
  statusMessage: string | null;
  statusKind: "success" | "error" | "info" | null;
};

export async function testLocalLmConnection(
  state: LocalLmDashboardState,
  onUpdateState: (patch: Partial<LocalLmDashboardState>, event?: Event) => void,
  event?: Event,
): Promise<boolean> {
  onUpdateState({ testing: true, statusMessage: "Testing connection to local LM...", statusKind: "info" }, event);
  try {
    const url = state.baseUrl.endsWith("/") ? `${state.baseUrl}models` : `${state.baseUrl}/models`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status} ${response.statusText}`);
    }
    const data = (await response.json()) as { data?: Array<{ id: string }> };
    const modelCount = data.data?.length ?? 0;
    onUpdateState({
      testing: false,
      statusKind: "success",
      statusMessage: `Connected successfully! Local server is online (${modelCount} models detected).`,
    }, event);
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    onUpdateState({
      testing: false,
      statusKind: "error",
      statusMessage: `Connection failed: ${msg}. Ensure your local LM engine is running.`,
    }, event);
    return false;
  }
}

export function renderLocalLmDashboard(
  state: LocalLmDashboardState,
  onUpdateState: (patch: Partial<LocalLmDashboardState>, event?: Event) => void,
  onConnectAndSave?: () => void,
): TemplateResult {
  const currentPreset = LOCAL_LM_PRESETS[state.selectedPresetKey] ?? LOCAL_LM_PRESETS.kkimi;

  const handlePresetSelect = (event: Event) => {
    const key = (event.target as HTMLSelectElement).value;
    const preset = LOCAL_LM_PRESETS[key];
    if (preset) {
      onUpdateState({
        selectedPresetKey: key,
        engine: preset.engine,
        baseUrl: preset.defaultBaseUrl,
        modelId: preset.defaultModelId,
        statusMessage: null,
        statusKind: null,
      }, event);
    }
  };

  return html`
    <section class="settings-section local-lm-dashboard" data-testid="local-lm-dashboard">
      <div class="settings-section__header">
        <h2>${icons.shieldCheck} Local LM Connect Dashboard</h2>
        <p class="muted">
          Connect your local AI language model engine (Ollama, LM Studio, vLLM, llama.cpp, SGLang)
          privately without any outer API keys.
        </p>
      </div>

      <div class="model-setup__rows" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="field">
          <label><strong>Open-Source Model Family Preset</strong></label>
          <select
            class="input"
            .value=${state.selectedPresetKey}
            @change=${handlePresetSelect}
            ?disabled=${state.testing}
          >
            ${Object.entries(LOCAL_LM_PRESETS).map(
              ([key, preset]) => html`
                <option value=${key} ?selected=${key === state.selectedPresetKey}>
                  ${preset.name} (${preset.defaultModelId})
                </option>
              `,
            )}
          </select>
          <div class="muted"><small>${currentPreset.description}</small></div>
        </div>

        <div class="field-group" style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <div class="field" style="flex: 1; min-width: 200px;">
            <label><strong>Inference Engine</strong></label>
            <select
              class="input"
              .value=${state.engine}
              @change=${(e: Event) =>
                onUpdateState({ engine: (e.target as HTMLSelectElement).value as LocalLmEngine }, e)}
              ?disabled=${state.testing}
            >
              <option value="ollama" ?selected=${state.engine === "ollama"}>Ollama (default port 11434)</option>
              <option value="lmstudio" ?selected=${state.engine === "lmstudio"}>LM Studio (default port 1234)</option>
              <option value="vllm" ?selected=${state.engine === "vllm"}>vLLM Engine (default port 8000)</option>
              <option value="llama-cpp" ?selected=${state.engine === "llama-cpp"}>llama.cpp Server (default port 8080)</option>
              <option value="sglang" ?selected=${state.engine === "sglang"}>SGLang Server (default port 30000)</option>
              <option value="custom-openai" ?selected=${state.engine === "custom-openai"}>Custom OpenAI-Compatible API</option>
            </select>
          </div>

          <div class="field" style="flex: 2; min-width: 250px;">
            <label><strong>Local Base Endpoint URL</strong></label>
            <input
              type="text"
              class="input"
              .value=${state.baseUrl}
              @input=${(e: Event) =>
                onUpdateState({ baseUrl: (e.target as HTMLInputElement).value }, e)}
              placeholder="http://localhost:11434/v1"
              ?disabled=${state.testing}
            />
          </div>
        </div>

        <div class="field">
          <label><strong>Model ID / Ref</strong></label>
          <input
            type="text"
            class="input"
            .value=${state.modelId}
            @input=${(e: Event) =>
              onUpdateState({ modelId: (e.target as HTMLInputElement).value }, e)}
            placeholder="e.g. qwen2.5-72b-instruct"
            ?disabled=${state.testing}
          />
        </div>

        ${state.statusMessage
          ? html`
              <div
                class=${`callout ${state.statusKind === "success" ? "success" : state.statusKind === "error" ? "danger" : "info"}`}
                role="status"
              >
                ${state.statusMessage}
              </div>
            `
          : nothing}

        <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
          <button
            type="button"
            class="btn"
            ?disabled=${state.testing}
            @click=${(e: Event) => testLocalLmConnection(state, onUpdateState, e)}
          >
            ${state.testing ? "Testing..." : "Test Local Connection"}
          </button>
          ${onConnectAndSave
            ? html`
                <button
                  type="button"
                  class="btn primary"
                  ?disabled=${state.testing}
                  @click=${onConnectAndSave}
                >
                  Save & Set Active Model
                </button>
              `
            : nothing}
        </div>
      </div>
    </section>
  `;
}
