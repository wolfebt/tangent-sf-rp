# **BASTION and AIME**

# **BASTION and AIME** 

# **Artificial Intelligences in the TANGENT SFF RP Ecosystem**

The transition of Virtual Tabletop environments from static record-keeping utilities into dynamic, simulated realities necessitates a fundamental architectural paradigm shift. The Tangent Science Fantasy Roleplay (TANGENT SFF RP) system operates on a highly structured React 18 frontend, persisting data through an IndexedDB offline-first cache synchronized to Firebase Firestore1. To seamlessly introduce the BASTION artificial intelligence as a mechanical pair-Game Master and asset designer, alongside the AIME artificial intelligence as a narrative specialist and non-player character actor, the system must bridge tightly authored narrative generation with deeply simulated mathematical world states.  
This comprehensive integration relies on a dual-layered approach. The foundational layer utilizes Google Antigravity, an agent-first development platform, to orchestrate the construction of the codebase, manage repository context, and deploy custom development skills3. The runtime layer leverages Firebase Genkit, a production-grade orchestration framework, to manage the execution of the BASTION and AIME entities within the live application4. By unifying Genkit’s structured Zod schema outputs, Firestore Vector Search for Retrieval-Augmented Generation, and a Parameterized-Action Partially Observable Markov Decision Process for state mutation, the TANGENT ecosystem can host autonomous agents capable of modifying canonical game state without introducing database corruption6.

## **The Agent-First Development Layer: Google Antigravity Infrastructure**

Constructing a highly relational database application like TANGENT requires the development environment to maintain a persistent understanding of the game's internal logic, including the 150 Build Point character economy, the Omnicortex rules compendium, and the Unified Difficulty Unit engine2. Traditional artificial intelligence coding assistants operate as stateless autocomplete engines, requiring constant human supervision and context switching3. Google Antigravity completely rewrites this relationship by unbundling the development lifecycle into specialized, sandboxed agents operating across the editor, terminal, and browser, shifting the developer's role to high-level orchestration1.  
The Antigravity runtime uses a hierarchical supervisor-worker topology to execute complex engineering tasks. The supervisor agent, operating with a massive context window of up to two million tokens, manages the global architectural blueprint and constructs execution task lists in the form of a Directed Acyclic Graph. The supervisor delegates atomic operations to ephemeral worker subagents that operate within restricted token windows inside isolated virtual filesystem namespaces.

### **Mitigating Context Window Compaction Amnesia**

When engineering the BASTION and AIME integrations, the Antigravity orchestration agent must analyze extensive React component trees, Firebase schema definitions, and TANGENT markdown rulebooks1. During long-running background tasks, the system routinely cleans its active memory through a process called Context Compaction. At approximately 135,000 tokens, the orchestrator synthesizes the conversational history, purges redundant tool-call logs, and serializes the current filesystem state into an immutable manifest.  
However, relying strictly on the large language model to dynamically summarize its own environment state frequently triggers a critical failure mode known as Context Window Compaction Amnesia3. Following compaction, the model loses the specific details of previously ingested files, retaining only a high-level summary9. To recover the lost data, the agent initiates recursive file reads, instantly refilling the context window, triggering subsequent compactions, and exhausting token processing limits without producing actionable code.  
To ensure the Antigravity agent can successfully architect the TANGENT integration without memory degradation, the development workflow must enforce strict mitigation protocols. The system must inject immutable codebase metadata as system headers at the top of every post-compaction prompt, explicitly mapping the active workspace structure. Furthermore, the orchestrator must utilize intermediate disk writes, serializing complex analysis into physical markdown files rather than holding the logic within the volatile context window. If an agent re-reads a target file more than three times without advancing the Directed Acyclic Graph, the daemon must halt execution and force a manual checkpoint.

### **Authoring Custom Workspace Skills for TANGENT Rule Validation**

To prevent tool bloat and context saturation, Antigravity utilizes a Custom Skills framework that loads domain-specific instructions exclusively when semantically relevant to the active prompt3. Indiscriminately loading an agent with hundreds of global API manuals causes high latency and context confusion8. For the TANGENT project, the system's unique mathematical mechanics must be encoded as custom Workspace Skills located strictly at \<workspace-root\>/.antigravity/skills/.  
A skill is governed by a mandatory SKILL.md file acting as the declarative interface contract between the LLM runtime and the dynamic execution sandbox. The background daemon computes a vector embedding of the file's goal block, utilizing cosine similarity matches to dynamically inject the instructions into the context window only when the developer requests tasks related to that specific domain.  
A custom skill designed to teach the Antigravity agent how to construct BASTION rule validators must conform to a standardized architectural structure.

YAML  
\---  
name: tangent-mechanics-validator  
description: Standardizes logic for TANGENT Dual Resolution mechanics and 150 BP character validation. Invoke when writing Genkit flows or React components related to dice resolution, target numbers, or the Omnicortex database.  
tools:  
  \- mcp\_local-firestore-emulator\_\*  
\---

Following the YAML frontmatter, the file specifies the primary objective, step-by-step procedural templates, and few-shot examples of correct application state parsing3. Crucially, the file must conclude with a strict constraints block defining negative guardrails. For TANGENT, a mandatory constraint must explicitly instruct the agent never to bypass the Increment Rule, ensuring that no generated advancement logic applies more than a single point to an ability score or skill rank per experience award2.

### **Model Context Protocol Interoperability and Transport Mechanisms**

The Model Context Protocol establishes the foundational transport layer standardizing how the Antigravity development environment and the deployed Genkit runtime interact with external data sources12. The protocol utilizes a client-server architecture containing host applications, clients, and localized servers, transforming the traditionally fragmented integration landscape into a unified standard12.  
The transport mechanism dictates how JSON-RPC 2.0 payloads are transmitted between the client and the server, which profoundly impacts system latency, concurrency, and security15. Selecting the correct transport is paramount for the operational success of the TANGENT architecture.

| Transport Mechanism | Architecture and Protocol | Target Environment | Latency Profile | Scalability and Security |
| :---- | :---- | :---- | :---- | :---- |
| **STDIO (Standard I/O)** | Subprocess spawning via stdin/stdout. Messages are newline-delimited JSON-RPC 2.0. | Local development and single-machine operation. | \~1–5 milliseconds. Zero network overhead15. | Highly secure, process-isolated, no network exposure. Fails at multi-tenant scale due to process-per-client limitations15. |
| **Server-Sent Events (SSE)** | Unidirectional event stream over HTTP. Client polls for state. | Legacy remote connections. | \~50–200 milliseconds. Highly variable under load16. | Deprecated in the 2025-03-26 specification due to connection drops and lack of resumable streams14. |
| **Streamable HTTP** | Stateless HTTP GET/POST on a unified endpoint. | Cloud environments, concurrent multi-client usage. | \~10 milliseconds under sustained load16. | Supports horizontal scaling, native load balancing, resumable streams, and centralized authentication19. |

During the active development phase of the TANGENT application, the Antigravity IDE functions as the client connecting to a local STDIO server, securely interacting with the local Firebase emulators without requiring complex network configuration15. However, in production, the Genkit instances powering the BASTION and AIME artificial intelligences must utilize the Streamable HTTP transport mechanism to maintain highly scalable, concurrent connections to the Firebase architecture, preserving a strict 10-millisecond latency envelope under sustained multiplayer traffic loads19.

## **Firebase Genkit Runtime Orchestration and Structured Output**

While Google Antigravity serves to build the application codebase, Firebase Genkit operates as the production runtime orchestrating the BASTION and AIME entities within the live TANGENT SFF RP environment4. Genkit provides a strongly typed TypeScript framework for defining complex artificial intelligence interactions as modular, observable sequences known as Flows5.

### **Defining Genkit Flows and Dynamic Tool Calling**

Genkit abstracts the complexities of prompt engineering, history management, and model execution into functional components21. A Genkit Flow represents a complete operational lifecycle, taking a typed input, executing conditional data transformations, invoking external tools, querying the language model, and returning a typed output21.  
Both BASTION and AIME rely heavily on dynamic Tool Calling (Function Calling) to interface seamlessly with the deterministic game engine5. The language model is provided with an explicit registry of tools; if the model determines that a specific mechanical action is required to fulfill the player's prompt, it suspends text generation, emits a structured JSON tool request, and waits for the application to return the execution result5.  
Tools within the Genkit framework are defined using the defineTool method and require strict Zod validation schemas to guarantee type safety26. For example, the tool allowing BASTION to resolve a trained skill check requires an input schema capturing the polyhedral notation, the linked attribute modifier, the skill rank, and the target number2. This ensures the data shape is verified before the system calculates the 2d10 or d20 results natively in the JavaScript engine, entirely preventing the language model from hallucinating the mathematical outcome2.

### **Structured Generation via Zod Schemas**

A primary technical hazard of integrating generative artificial intelligence into a Virtual Tabletop is the risk of the model returning malformed conversational text instead of actionable system data6. To automatically ingest BASTION's generated assets or AIME's narrative encounters directly into the Firestore database, the outputs must be perfectly structured5.  
Genkit integrates natively with Zod, a TypeScript schema declaration library, to enforce structured output generation at the framework level5. By defining an outputSchema within a Genkit Flow, the framework forces the underlying model to constrain its generation to the exact JSON structure required by the TANGENT application23. If the model generates a schema violation, Genkit automatically intercepts the failure, utilizing the model's native structured output mode to initiate a localized retry loop24.  
When BASTION operates as an asset designer generating a new weapon utilizing the Weapon Mod Stacker Matrix, the output schema guarantees the presence of all required canonical fields2.

TypeScript  
const WeaponAssetSchema \= z.object({  
  id: z.string().uuid(),  
  name: z.string(),  
  strikeBonus: z.number().int(),  
  damageDice: z.string().regex(/^\[1-9\]d\[468\]|10|12|20|100(\\+\[0-9\]+)?$/),  
  rateOfFire: z.number().int(),  
  armorPenetration: z.number().int(),  
  manufacturerSkin: z.string(),  
  megacreditCost: z.number()  
});

This strict type safety ensures that assets generated during live gameplay can be immediately summoned into the Persona Folio inventory and the Tactical Map Maker without requiring manual validation from the human Architect.

### **Serverless Deployment and Cloud Functions Security**

To integrate the Genkit workflows directly into the existing TANGENT architecture, the flows are exposed to the React 18 client via the onCallGenkit wrapper28. This wrapper transforms a localized Genkit Flow into a highly secure, callable endpoint hosted on Cloud Functions for Firebase within the second-generation runtime environment.  
The onCallGenkit wrapper automatically inherits the Firebase context, allowing the execution flow to seamlessly authenticate users without manual token parsing. The context.auth object injects the user's Decoded ID Token directly into the logic layer, ensuring that BASTION can independently verify whether the requesting user possesses Architect privileges before executing destructive database modifications29.  
Crucially, onCallGenkit supports Firebase App Check declaratively. By configuring enforceAppCheck: true within the endpoint setup, the system utilizes native cryptographic attestation to confirm that API requests originate exclusively from the legitimate TANGENT SFF RP React client. This explicitly prevents malicious actors from extracting the endpoint URLs and targeting the language models via external scripts to bypass rate limits or accrue excessive cloud computing costs.

## **Vector Search and Retrieval-Augmented Generation Architecture**

To function effectively as a pair-Game Master and a narrative specialist, BASTION and AIME must comprehend the entirety of the TANGENT ruleset, encompassing the 14 Omnicortex collections, the complex scaling rules across 8 size tiers, and the planetary universal world profiles2. Passing the entire rules compendium in the system prompt for every execution is prohibitively expensive, introduces severe latency, and rapidly exhausts the model's context window3. Instead, the system must utilize Retrieval-Augmented Generation to dynamically fetch only the semantically relevant rules and lore immediately prior to generation19.

### **Embedding the Omnicortex Compendium**

The foundation of the Retrieval-Augmented Generation pipeline involves transforming the TANGENT compendium into numerical representations known as vector embeddings4. Utilizing Genkit's native integration with Google Cloud Vertex AI, the system processes the raw markdown files and JSON schemas ingested through the Codex Ingestion Engine2.  
The optimal model for generating text embeddings in this context is text-embedding-004, which outputs highly dense 768-dimensional vectors optimized for semantic similarity33. Because the TANGENT ruleset contains highly structured, interdependent tables—such as the Economatrix curve and the armor coverage locational slots—the ingestion pipeline must utilize semantic chunking strategies with overlapping windows2. Preserving semantic boundaries ensures that mechanical prerequisites are not isolated from their parent rules during the embedding calculation, preventing context fragmentation during retrieval31.

### **Firestore K-Nearest Neighbor Indexing**

The generated embeddings are stored natively as a Vector data type alongside the original text chunks within the Cloud Firestore database32. To perform rapid similarity matching across 768 dimensions, Firestore requires the creation of a specialized Composite Index supporting exact K-Nearest Neighbor search19.  
The index must be explicitly generated using the gcloud command-line interface, specifying the exact dimensions matching the embedding output model34. To properly index an embedding field within the omnicortex collection group, the correct operational command is:

Bash  
gcloud firestore indexes composite create \\  
  \--collection-group=omnicortex \\  
  \--query-scope=COLLECTION \\  
  \--field-config field-path=embedding,vector-config='{"dimension":"768", "flat": "{}"}' \\  
  \--database=(default)

With the composite index active, BASTION can execute high-speed find\_nearest queries37. When a player asks a mechanical question via the CommLink Quick Dock, the Genkit flow converts the user's natural language query into a 768-dimensional vector, computes the Euclidean distance or dot product against the database index, and retrieves the top most relevant rules text chunks20. These chunks are dynamically injected into BASTION's system prompt, grounding the artificial intelligence's response in canonical game rules and eliminating the risk of mechanical hallucinations31.

## **Orchestrating BASTION: The Mechanical Authority**

BASTION serves as the definitive mechanical authority within the TANGENT ecosystem. Its responsibilities include validating 150 BP character legality, verifying Economatrix construction timelines, adjudicating combat checks, resolving Dual Resolution mechanics, and autonomously designing compliant architectural blueprints and mecha chassis1.

### **The Parameterized-Action POMDP and the PDVA Pipeline**

Traditional large language model integrations in interactive gaming suffer from profound structural flaws because the narrative voice attempts to assert state changes in free prose6. This methodology leads to a phenomenon where the game world silently drifts, accumulates contradictions, and eventually suffers from systemic amnesia8. If BASTION attempts to manage a starship combat encounter merely by outputting text describing an explosion, the React Konva Virtual Tabletop and the IndexedDB persistence layer remain entirely unaware of the event1.  
To resolve this limitation, BASTION must be structured around Orchestrated Reality principles, formalizing the Virtual Tabletop as a Parameterized-Action Partially Observable Markov Decision Process8. In this rigorous framework, the game state (![][image1]) is not a text summary; it is the exact, canonical tree of JSON entities residing in Firestore, representing character folios, active scenarios, and map tokens8. Player actions are treated as parameterized intents, denoted as ![][image2]8.  
The transition kernel governing state changes relies on a strict Plan-Diff-Validate-Apply pipeline8.

> 1. **Plan:** BASTION ingests the current canonical JSON state slice and the player's parameterized intent8.  
> 2. **Diff:** Instead of prose, BASTION utilizes structured Zod outputs to propose an explicit JSON mutation delta (![][image3]), specifying the exact path, operation, and value changes required8.  
> 3. **Validate:** The system executes deterministic JavaScript functions to evaluate the delta against the TANGENT game rules8. The UDU Engine and Complex Systems Engine assess if the action is mathematically valid, confirming prerequisites such as the player possessing the required vitality pool to absorb movement fatigue2.  
> 4. **Apply:** If validation succeeds, the JSON delta commits atomically to Firestore8. The React Konva map maker detects the database mutation via a native snapshot listener and automatically updates the token positions, status gems, and health bars across all connected multiplayer clients simultaneously2.

By restricting BASTION to proposing structured JSON diffs evaluated by pure deterministic engines, the integrity of the 150 BP economy and the 7-tier crafting timetable remains mathematically secure2.

### **Adjudicating Project Building Antigravity and In-Game Locomotion Hazards**

The user query explicitly mandates specific artificial intelligence implementation directions for adjudicating antigravity mechanics in project building. This directive necessitates a dual-layered execution spanning both the external development environment and the internal game simulation.  
From an infrastructure perspective, constructing the project utilizing Google Antigravity requires the orchestrator to leverage its multi-agent parallel execution loops. The developer delegates the creation of the zero-G logic modules to a designated backend subagent, which utilizes the custom Workspace Skills to map the mathematical relationships between character agility and movement penalties.  
From an in-game mechanical perspective, the TANGENT ruleset features comprehensive locomotion modes, including zero-G environments, vacuum traversal, inertia drift, and variable flight thrusters2. When a player token initiates movement across a zero-G biome painted on the Tactical Map Maker, the frontend issues a movement intent directly to the BASTION Genkit flow2.  
BASTION autonomously retrieves the token's biological metrics (Fortitude, Reflex) and current equipment loadout (magnetic boots, reaction thrusters) from the Persona Folio identity tab2. The artificial intelligence evaluates the environmental hazard rating utilizing the UDU Engine2. If the player executes sudden course changes in a vacuum without proper thruster stabilization, BASTION identifies the necessity of an inertia drift check and pauses the application to request a Reflex Check (d20 \+ Reflex Score \+ Modifiers vs. CR) via the CommLink Relay2.  
Once the player executes the /roll command, BASTION parses the polyhedral result, calculates the margin of success or failure based on the Dual Resolution Architecture, and emits a JSON state diff to update the token's coordinates2. If the check results in a critical fumble, the diff applies physical Health damage based on high-speed impact rules directly to the token's structural integrity2.

## **Orchestrating AIME: The Narrative Specialist and NPC Actor**

While BASTION manages the rigid mathematics and rule adjudications of the Virtual Tabletop, the Artificial Intellect Master Entity manages the prose, psychological profiles, and dynamic storytelling elements of the campaign1. AIME acts as a specialized conversational agent, auto-drafting deep character backstories across four structured narrative categories and managing the Story Weaver Scenario Engine1.

### **Master of the Story Foundry and Scenario Trees**

AIME serves as the overarching master of the entire Story Foundry system, directly interfacing with the Story Weaver's hierarchical scenario tree to provide comprehensive narrative mastery1. The scenario tree organizes campaigns into Acts, Chapters, Scenes, and Encounters, linking out to eight distinct element types such as Locations, Factions, and Relics2.  
Instead of forcing the Architect into a "blind search" for narrative direction, AIME powers a dynamic, module-styled adventure build system. When an Architect initiates a new story module, AIME generates structured AI guidelines that provide a robust narrative framework1. AIME evaluates the general science-fantasy genre context and recommends specific asset components from the Element Forge needed to ground the scenario—such as identifying which syndicate faction assets or hazard overlays are required for a given setting1.  
Within this story framework, AIME actively assists the Architect in managing interactive narrative branching. The artificial intelligence maps out complex "if/then" conditions based on anticipated player actions, suggesting logical environmental considerations, status effects, and mechanical modifiers that seamlessly bridge the narrative consequences with BASTION's rigid UDU engine2. This ensures that every generated story module is not merely a static text document, but a deeply interactive and mechanically supported component of the broader TANGENT ecosystem.

### **Multi-Agent Orchestration and Intent Routing**

In an enterprise-grade application, relying on a single monolithic prompt to handle all narrative inquiries leads to cognitive overload and degraded instruction adherence23. AIME avoids this limitation by utilizing a hierarchical multi-agent pattern orchestrated through the Genkit framework.  
When a request enters the AIME Creative Suite, a root orchestrator agent assesses the input and autonomously delegates the request to specialized sub-agents implemented as individual Genkit tools.

* If the Architect requests a new planetary Universal World Profile to be drafted, the orchestrator routes the request to the Planetary Engine sub-agent, which is strictly grounded in the procedural generation matrices and the 16-Domain Civilization Radar2.  
* If the Architect requests live dialogue for a syndicate boss during a tactical encounter, the orchestrator invokes the NPC Actor sub-agent, passing the non-player character's psychological profile and faction data retrieved directly from the Element Forge2.

This strict separation of concerns ensures that each sub-agent operates with a highly focused system prompt, minimizing token consumption, mitigating hallucinations, and significantly elevating narrative consistency.

### **Server-Sent Events and the Streaming User Interface**

When generating long-form prose, such as the 3-Stage AIME Manuscript Engine producing scene premises, pacing ladders, and dramatic turning points, generating the entire document server-side before transmitting the response results in unacceptable latency often exceeding 3,000 milliseconds2. This delay breaks the immersion of real-time conversational interfaces and frustrates the Architect42.  
To circumvent this limitation, AIME's onCallGenkit endpoints are explicitly configured to return streaming responses utilizing Server-Sent Events28. By leveraging Genkit's stream interface, the Cloud Function yields iterative text chunks as they are generated by the underlying model29. The React frontend receives these continuous chunks and incrementally paints the text into the CommLink Quick Dock or the Story Weaver drafting panel2.  
This streaming architecture dramatically reduces the Time to First Byte to under 500 milliseconds. Users perceive the artificial intelligence as highly responsive and interactive, which is a critical user experience requirement when utilizing the floating AI prose tools to expand, rephrase, or tighten manuscript text during live game sessions2.

## **Telemetry, Observability, and RAGAS Evaluation Metrics**

Deploying non-deterministic language models into a structured roleplaying environment demands comprehensive observability and rigorous quality assurance. Without deep tracking, an artificial intelligence might silently accumulate latency, hallucinate rules, or accrue excessive financial costs due to infinite context looping44.

### **Google Cloud Trace and Genkit Telemetry Integration**

The Firebase Genkit integration provides native support for OpenTelemetry44. By installing the @genkit-ai/firebase telemetry plugin, the TANGENT application automatically intercepts execution spans and exports them to Google Cloud Operations44.  
Every execution of BASTION or AIME generates a distributed trace containing rich system metadata44. The Firebase Genkit Monitoring dashboard visualizes real-time metrics, grouping data by flow name, and tracking critical system health indicators necessary for production stability44.

* **Latency Monitoring (genkit/flow/latency):** Measures the duration of the entire request lifecycle. Identifying latency spikes in the 95th percentile allows administrators to optimize slow vector retrieval configurations45.  
* **Token Metrics (genkit/ai/generate/input\_tokens):** Tracks the exact volume of input and output tokens consumed per request44. This is vital for maintaining cost efficiency, ensuring that the retrieved context does not needlessly overload the model's context window25.  
* **Error Tracing:** Captures stack traces and unhandled schema validation errors, allowing developers to immediately identify which subset of the Zod schemas caused a generation failure25.

### **Evaluating System Performance via the RAGAS Framework**

To continuously measure and refine the performance of the vector database retrievers and the underlying language models, the system employs the Retrieval-Augmented Generation Assessment System framework49. Evaluating complex pipelines requires decoupling the retrieval quality from the generation quality52.

#### **1\. Evaluating Retrieval Quality: Context Precision**

Context Precision evaluates the Firestore vector index's ability to rank relevant Omnicortex rules higher than irrelevant ones within the top retrieved results41. It determines whether the most critical gameplay mechanics are placed at the absolute top of the retrieved context window49.  
The metric is mathematically calculated as the mean of the precision at rank ![][image4] for each chunk, weighted by its relevance indicator ![][image5]23.  
![][image6]  
By continuously monitoring Context Precision, developers can mathematically tune the Euclidean distance thresholds and semantic chunk sizes to ensure BASTION always accesses the correct formulas prior to executing a calculation23.

#### **2\. Evaluating Generation Quality: Faithfulness and Answer Relevancy**

Once the context is successfully retrieved, the RAGAS framework evaluates the generation phase.

| Generation Metric | Evaluation Focus | Calculation Methodology | TANGENT Application |
| :---- | :---- | :---- | :---- |
| **Faithfulness** | Factual consistency against retrieved context51. | Extracts all factual claims from the response and verifies if the context supports them51. | Prevents BASTION from hallucinating scaling multipliers (e.g., stating a vehicle has a 10x multiplier when the Codex dictates 20x)2. |
| **Answer Relevancy** | Direct alignment with the user's prompt54. | Reverse-engineers artificial questions from the generated response and calculates the cosine similarity against the original query56. | Ensures AIME's narrative prose remains tightly coupled to the active scenario rather than meandering into unrelated tangents55. |

By embedding these metrics into automated testing suites, any updates to the TANGENT codebase or the Omnicortex database can be systematically regression-tested, guaranteeing that both artificial intelligence agents maintain peak operational reliability across all game sessions46.

#### **Works cited**

> 1. README.md  
> 2. TANGENT\_SF\_RP\_COMPREHENSIVE\_USER\_GUIDE.md  
> 3. \- GOOGLE ANTIGRAVITY GUIDE, [https://drive.google.com/open?id=1oND4Wczt7\_sMOB0SKjR\_XtYoe2VNCdME3LVxQqOlLUs](https://drive.google.com/open?id=1oND4Wczt7_sMOB0SKjR_XtYoe2VNCdME3LVxQqOlLUs)  
> 4. Serverless AI Applications: A Deep Dive into Genkit and Firebase, [https://medium.com/@theshivamlko/serverless-ai-applications-a-deep-dive-into-genkit-and-firebase-19349894182f](https://medium.com/@theshivamlko/serverless-ai-applications-a-deep-dive-into-genkit-and-firebase-19349894182f)  
> 5. Understanding Firebase Genkit and its Capabilities \- Walturn, [https://www.walturn.com/insights/understanding-firebase-genkit-and-its-capabilities](https://www.walturn.com/insights/understanding-firebase-genkit-and-its-capabilities)  
> 6. Orchestrated Reality: From Role-Play to Living, Playable Game Worlds, [https://arxiv.org/html/2606.16014v1](https://arxiv.org/html/2606.16014v1)  
> 7. From Character Role-Play to Orchestrated Reality \- Ludic Dynamics, [https://ludicdynamics.com/orchestrated-reality/](https://ludicdynamics.com/orchestrated-reality/)  
> 8. Google Antigravity Technical Report, [https://drive.google.com/open?id=1QBLV-UiN7eHrUmikBs0QM3zWb7gT63aQVITRMRbSxrk](https://drive.google.com/open?id=1QBLV-UiN7eHrUmikBs0QM3zWb7gT63aQVITRMRbSxrk)  
> 9. Antigravity 2.0..... lackluster? Gemini 3.5 Flash seems, [https://discuss.ai.google.dev/t/antigravity-2-0-lackluster-gemini-3-5-flash-seems/145461](https://discuss.ai.google.dev/t/antigravity-2-0-lackluster-gemini-3-5-flash-seems/145461)  
> 10. Tutorial : Getting Started with Google Antigravity Skills \- Medium, [https://medium.com/google-cloud/tutorial-getting-started-with-antigravity-skills-864041811e0d](https://medium.com/google-cloud/tutorial-getting-started-with-antigravity-skills-864041811e0d)  
> 11. Authoring Google Antigravity Skills \- Codelabs, [https://codelabs.developers.google.com/getting-started-with-antigravity-skills](https://codelabs.developers.google.com/getting-started-with-antigravity-skills)  
> 12. Model Context Protocol (MCP) an overview \- Philschmid, [https://www.philschmid.de/mcp-introduction](https://www.philschmid.de/mcp-introduction)  
> 13. Exploring the Genkit MCP Server: Your Secret Weapon for AI, [https://skywork.ai/skypage/en/genkit-mcp-server-ai-integration/1978660656626913280](https://skywork.ai/skypage/en/genkit-mcp-server-ai-integration/1978660656626913280)  
> 14. What Is the Model Context Protocol (MCP) and How It Works, [https://www.descope.com/learn/post/mcp](https://www.descope.com/learn/post/mcp)  
> 15. MCP Transport Mechanisms: STDIO vs Streamable HTTP, [https://builder.aws.com/content/35A0IphCeLvYzly9Sw40G1dVNzc/mcp-transport-mechanisms-stdio-vs-streamable-http](https://builder.aws.com/content/35A0IphCeLvYzly9Sw40G1dVNzc/mcp-transport-mechanisms-stdio-vs-streamable-http)  
> 16. MCP Transport Comparison: stdio vs SSE vs Streamable HTTP, [https://gingerlabs.ai/blog/mcp-transport-comparison](https://gingerlabs.ai/blog/mcp-transport-comparison)  
> 17. MCP Transport Comparison Study: GitHub Official Remote Server vs, [https://github.com/Joseph19820124/mcp-transport-comparison-study](https://github.com/Joseph19820124/mcp-transport-comparison-study)  
> 18. MCP Transport: Stdio vs Streamable HTTP \- Truefoundry, [https://www.truefoundry.com/blog/mcp-stdio-vs-streamable-http-enterprise](https://www.truefoundry.com/blog/mcp-stdio-vs-streamable-http-enterprise)  
> 19. Get started with Firestore vector similarity search | Google Cloud Blog, [https://cloud.google.com/blog/products/databases/get-started-with-firestore-vector-similarity-search](https://cloud.google.com/blog/products/databases/get-started-with-firestore-vector-similarity-search)  
> 20. Search with vector embeddings | Firestore \- Firebase \- Google, [https://firebase.google.com/docs/firestore/vector-search](https://firebase.google.com/docs/firestore/vector-search)  
> 21. Firebase Genkit-AI: Level Up Your Skills with AI-Powered Flows, [https://dev.to/playfulprogramming/firebase-genkit-ai-level-up-your-skills-with-ai-powered-flows-3foj](https://dev.to/playfulprogramming/firebase-genkit-ai-level-up-your-skills-with-ai-powered-flows-3foj)  
> 22. Build AI-Powered Apps With Genkit and Angular, [https://blog.angular.dev/build-ai-powered-apps-with-genkit-and-angular-707db8918c3a](https://blog.angular.dev/build-ai-powered-apps-with-genkit-and-angular-707db8918c3a)  
> 23. Building a Multi-Agent System with Tool Calling using Angular, [https://dev.to/wayne\_gakuo/building-a-multi-agent-system-with-tool-calling-using-angular-firebase-genkit-5h83](https://dev.to/wayne_gakuo/building-a-multi-agent-system-with-tool-calling-using-angular-firebase-genkit-5h83)  
> 24. Vercel AI SDK vs LangChain.js vs Firebase Genkit for Startups, [https://kanopylabs.com/blog/vercel-ai-sdk-vs-langchainjs-vs-firebase-genkit](https://kanopylabs.com/blog/vercel-ai-sdk-vs-langchainjs-vs-firebase-genkit)  
> 25. Tool calling \- Genkit, [https://genkit.dev/docs/go/tool-calling/](https://genkit.dev/docs/go/tool-calling/)  
> 26. genkit \- NPM, [https://www.npmjs.com/package/genkit](https://www.npmjs.com/package/genkit)  
> 27. Firebase Genkit — AI Application by Javascript/Typescript \- Medium, [https://bunhere.medium.com/firebase-genkit-ai-application-by-javascript-typescript-dec482e2c579](https://bunhere.medium.com/firebase-genkit-ai-application-by-javascript-typescript-dec482e2c579)  
> 28. Deploy with Firebase \- Genkit, [https://genkit.dev/docs/js/deployment/firebase/](https://genkit.dev/docs/js/deployment/firebase/)  
> 29. Invoke Genkit flows from your app | Cloud Functions for Firebase, [https://firebase.google.com/docs/functions/oncallgenkit](https://firebase.google.com/docs/functions/oncallgenkit)  
> 30. Authorization and integrity \- Genkit, [https://genkit.dev/docs/js/deployment/authorization/](https://genkit.dev/docs/js/deployment/authorization/)  
> 31. Building a RAG Pipeline with Gemini 2.5 and Vertex AI Vector, [https://medium.com/google-cloud/building-a-rag-pipeline-with-gemini-2-5-91546c2ceaf6](https://medium.com/google-cloud/building-a-rag-pipeline-with-gemini-2-5-91546c2ceaf6)  
> 32. Building a RAG application with vector search in Firestore \- Medium, [https://medium.com/google-cloud/building-a-rag-application-with-vector-search-in-firestore-71da2e6e7e77](https://medium.com/google-cloud/building-a-rag-application-with-vector-search-in-firestore-71da2e6e7e77)  
> 33. Google Generative AI plugin \- Genkit, [https://genkit.dev/docs/python/integrations/google-genai/](https://genkit.dev/docs/python/integrations/google-genai/)  
> 34. Firestore Vector Full-Text Search \- Code.Build, [https://code.build/p/firestore-vector-full-text-search-Gli7vK](https://code.build/p/firestore-vector-full-text-search-Gli7vK)  
> 35. Zero-Downtime Embedding Migration: Switching from text, [https://dev.to/humzakt/zero-downtime-embedding-migration-switching-from-text-embedding-004-to-text-embedding-3-large-in-1292](https://dev.to/humzakt/zero-downtime-embedding-migration-switching-from-text-embedding-004-to-text-embedding-3-large-in-1292)  
> 36. Scalar Types \- SQL Connect Reference \- Firebase \- Google, [https://firebase.google.com/docs/reference/sql-connect/gql/scalar](https://firebase.google.com/docs/reference/sql-connect/gql/scalar)  
> 37. Build and Deploy a Generative AI solution using a RAG framework, [https://github.com/dharantej1/Google\_L400\_Labs\_Solutions](https://github.com/dharantej1/Google_L400_Labs_Solutions)  
> 38. ついに来た Firebaseでベクトル検索 \- Zenn, [https://zenn.dev/miyasic/articles/firebase-search-with-vector-embeddings](https://zenn.dev/miyasic/articles/firebase-search-with-vector-embeddings)  
> 39. Firestore indexes composite create is Not working \- Stack Overflow, [https://stackoverflow.com/questions/78778235/firestore-indexes-composite-create-is-not-working](https://stackoverflow.com/questions/78778235/firestore-indexes-composite-create-is-not-working)  
> 40. How to Implement Vector Search in Firestore for AI-Powered, [https://oneuptime.com/blog/post/2026-02-17-how-to-implement-vector-search-in-firestore-for-ai-powered-similarity-matching/view](https://oneuptime.com/blog/post/2026-02-17-how-to-implement-vector-search-in-firestore-for-ai-powered-similarity-matching/view)  
> 41. RAG Evaluation Part 1: Retriever Evaluation, [https://vatsal.website/blogs/rag-evaluation-part-1-retriever-evaluation/](https://vatsal.website/blogs/rag-evaluation-part-1-retriever-evaluation/)  
> 42. taeold/firebase-live-demo-cf3-streaming \- GitHub, [https://github.com/taeold/firebase-live-demo-cf3-streaming](https://github.com/taeold/firebase-live-demo-cf3-streaming)  
> 43. Defining AI workflows | Genkit, [https://genkit.dev/docs/js/flows/](https://genkit.dev/docs/js/flows/)  
> 44. Observability \- Genkit, [https://firebase-genkit.mintlify.app/concepts/observability](https://firebase-genkit.mintlify.app/concepts/observability)  
> 45. Enable Genkit Monitoring in Your Firebase Gemini Chatbot, [https://invertase.io/blog/genkit-aim-firebase-extension](https://invertase.io/blog/genkit-aim-firebase-extension)  
> 46. Monitoring and Observability with Genkit Go, [https://mastering-genkit.github.io/mastering-genkit-go/chapters/13-monitoring-and-observability.html](https://mastering-genkit.github.io/mastering-genkit-go/chapters/13-monitoring-and-observability.html)  
> 47. Monitor your Genkit features in production \- The Firebase Blog, [https://firebase.blog/posts/2025/03/monitor-genkit-features-in-production/](https://firebase.blog/posts/2025/03/monitor-genkit-features-in-production/)  
> 48. Google Cloud plugin \- Genkit, [https://genkit.dev/docs/go/integrations/google-cloud/](https://genkit.dev/docs/go/integrations/google-cloud/)  
> 49. Context Precision \- Ragas, [https://docs.ragas.io/en/stable/concepts/metrics/available\_metrics/context\_precision/](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/context_precision/)  
> 50. RAG systems: Best practices to master evaluation for ... \- Google Cloud, [https://cloud.google.com/blog/products/ai-machine-learning/optimizing-rag-retrieval](https://cloud.google.com/blog/products/ai-machine-learning/optimizing-rag-retrieval)  
> 51. What is RAGAS (Retrieval-Augmented Generation Assessment, [https://www.articsledge.com/post/retrieval-augmented-generation-assessment-system-ragas](https://www.articsledge.com/post/retrieval-augmented-generation-assessment-system-ragas)  
> 52. Evaluating RAG Metrics in Applied Contexts: An Experiment, Its, [https://arxiv.org/html/2607.07302v1](https://arxiv.org/html/2607.07302v1)  
> 53. Metrics \- Ragas, [https://docs.ragas.io/en/v0.1.21/concepts/metrics/](https://docs.ragas.io/en/v0.1.21/concepts/metrics/)  
> 54. Evaluation | Genkit, [https://genkit.dev/docs/js/evaluation/](https://genkit.dev/docs/js/evaluation/)  
> 55. Evaluating Retrieval and RAG Systems: From DCG to Hit Rates to F, [https://community.ibm.com/community/user/blogs/aditya-santhosh/2025/10/03/understanding-metrics-ndcg-f-beta-etc](https://community.ibm.com/community/user/blogs/aditya-santhosh/2025/10/03/understanding-metrics-ndcg-f-beta-etc)  
> 56. Response Relevancy \- Ragas, [https://docs.ragas.io/en/stable/concepts/metrics/available\_metrics/answer\_relevance/](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/answer_relevance/)

# **TANGENT SFF RP AI Integration**

# **TANGENT SFF RP AI Integration**

This document serves as the master execution directive for the Google Antigravity orchestration agent and its specialized worker subagents. It dictates the rigorous, step-by-step implementation plan for integrating the **BASTION** (Mechanical Authority AI) and **AIME** (Narrative Artificial Intellect Master Entity) into the TANGENT Science Fantasy Roleplay ecosystem.

Because TANGENT operates as a highly complex, offline-first React 18 / Firebase Virtual Tabletop (VTT) relying on a strict 150 Build Point (BP) economy and dense tactical mechanics, the AI components must act as deterministic calculation engines and structured narrative routers, not unconstrained prose generators. This plan leverages Firebase Genkit to ensure reliable, mathematically sound AI execution.

## **Phase 1: Antigravity Workspace Initialization & Guardrail Setup**

To prevent "Context Window Compaction Amnesia"—a critical failure state where agents forget core rules when navigating the massive TANGENT Omnicortex ruleset and React codebase—the orchestration environment must first be rigorously structured with persistent memory anchors.

### **1.1 Immutable Architectural Headers**

* **Directive:** The Supervisor Agent must generate and maintain a .antigravity/project-manifest.md file.  
* **Content:** This manifest must map the exact React component tree interactions (e.g., how the Omnicortex DBM passes data to the Persona Folio, and how the Tactical Map Maker renders FolioHeroTokenDrawer assets via Konva). It must also explicitly define the hybrid storage strategy: a 1.5s debounced IndexedDB local cache that cascades into Firebase Firestore.  
* **Execution:** Configure the agent prompt headers to permanently prepend a condensed version of this manifest to the active context window after every automated AI memory compaction cycle. The agent must never lose sight of the Store \-\> Debounce \-\> Firestore pipeline.

### **1.2 Domain-Specific Custom Workspace Skills**

* **Directive:** Subagents must populate the .antigravity/skills/ directory with highly specific SKILL.md files. These act as hardcoded negative constraints to restrict rule-hallucinations during codebase and asset generation.  
* **Required Skills:**  
  * tangent-150bp-economy.md: Must contain strict logic enforcing the **Increment Rule** (e.g., "NEVER allow a character to advance an attribute or skill by more than 1 point per single AP expenditure"). It must validate that Initial Budget \+ Flaw Rebates \- Expenditures \= 0 (or \>0).  
  * tangent-dual-resolution.md: Demarcates the absolute boundary between Skill Rolls (2d10 \+ Attribute \+ Rank vs TN) and Attribute Checks/Saving Throws (d20 \+ Base Check \+ Mods vs CR).  
  * tangent-antigravity-hazards.md: Maps the exact mathematical relationships between zero-G traversal, inertia drift penalties (10ft per round), and the required DC 15 Reflex/Fortitude checks.  
  * tangent-udu-engine.md: Details the 10:1 Unified Difficulty Unit (UDU) conversion hierarchy (1 Module \= 10 Mounts \= 100 Sockets \= 1000 Nodes \= 10,000 Sub-Nodes) for asset generation.

### **1.3 Local Emulator & MCP Transport Configuration**

* **Directive:** Establish the Model Context Protocol (MCP) using a local STDIO server tailored for safe development.  
* **Execution:** Connect the Antigravity sandbox directly to the local Firebase Emulators (Firestore, Functions, Auth). This ensures the AI agents can iteratively test Genkit state mutations, complex database migrations, and BASTION token operations without risking the production database or triggering real-world cloud billing quotas. All AI-generated database writes must be verified in the emulator before generating the final merge commit.

## **Phase 2: BASTION Mechanical Rules Engine Implementation**

BASTION operates as the mechanical authority, pair-GM, and asset designer. The agent must construct BASTION not as an open-ended chatbot, but as a rigid state-mutation engine that interfaces directly with the Codex Matrix Suite.

### **2.1 Zod Schema Declarations**

* **Directive:** Define strict, exhaustively typed Zod validation schemas for all inbound requests and outbound AI generation. These schemas form the API contract between the LLM and the React frontend.  
* **Targets:**  
  * PersonaFolioSchema: Must track the three 20-point Background Skill Pools (Faction, Origin, Occupation) separately from the 150 BP pool.  
  * WeaponAssetSchema: Must require deterministic fields like strikeBonus (Integer), damageDice (String format XdY), armorPenetration (Integer), rateOfFire (Enum), and techLevel (0-5).  
  * MovementIntentSchema: Must capture startPos(x,y), endPos(x,y), and locomotionMode (Walk, Hustle, Zero-G).

### **2.2 The Plan-Diff-Validate-Apply (PDVA) Pipeline**

* **Directive:** Construct the core Genkit flows for BASTION utilizing a POMDP (Partially Observable Markov Decision Process) architecture. BASTION must evaluate the Fog of War and hidden GM states before allowing player actions.  
* **Execution Flow:**  
  1. **Plan & Diff:** The LLM receives the current game state via the RAG pipeline and outputs a StateMutationDelta JSON object representing the proposed change (e.g., applying 12 points of lethal damage to a Synthetic's Structure Pool).  
  2. **Validate:** The system intercepts the JSON and executes pure deterministic JavaScript functions (via tangentComplexEngines.js and tangentEntityEngines.js) to ensure the delta is mathematically valid according to the Codex.  
  3. **Apply:** Push the validated JSON delta to Firestore via atomic batch commits. Native React Konva snapshot listeners will automatically detect this delta and trigger FloatingCombatText animations on the UI for all connected players.

### **2.3 Deterministic Tool Calling & The Dice Fallback**

* **Directive:** Expose TANGENT’s native polyhedral dice logic to BASTION exclusively as strict Genkit tools.  
* **Constraint:** BASTION must *never* mathematically resolve dice rolls, calculate target numbers, or derive stat multipliers internally. If a player asks BASTION to resolve an attack, BASTION must parse the intent, invoke the /roll deterministic tool, suspend execution, wait for the systemic Web Audio API / Math.random() result, and *then* narrate the outcome.

## **Phase 3: AIME Narrative Story Foundry Integration**

AIME is the Master of the Story Foundry, responsible for narrative mastery, NPC acting, worldbuilding, and dynamic module construction. AIME acts as the creative counterpart to BASTION's mechanical rigidity.

### **3.1 Hierarchical Multi-Agent Orchestration**

* **Directive:** Build the root AIME Genkit orchestrator (aime-router-flow) to parse the Architect's creative intent and route sub-tasks to specialized domain agents.  
* **Routing Targets:**  
  * PlanetaryEngine Sub-Agent: Grounded in the 16-Domain Civilization Radar. When asked for a world, it generates a strict Universal World Profile (UWP) string (e.g., Starport, Atmosphere, Hydrographics) alongside descriptive prose.  
  * NPCActor Sub-Agent: Fed character psychological profiles, Faction alignments, and current Social Disposition Matrix standings to generate live combat dialogue or interrogation responses.  
  * LoreArchitect Sub-Agent: Manages the Element Forge connections, ensuring that if a new corporation is generated, it automatically establishes relational database links to existing planets or NPCs.

### **3.2 Dynamic Module Adventure Builder**

* **Directive:** Implement a procedural generation framework directly within the Story Weaver module.  
* **Execution:** When the Architect initiates the 3-Stage Manuscript Engine (Brainstorm \-\> Outline \-\> Draft), AIME must evaluate the overarching game genre/context and suggest specific asset components from the Element Forge to ground the scenario (e.g., pulling the "Toxic Ice" biome parameters and "Nanite Swarm" hazard overlays).  
* **If/Then Scenario Branching:** AIME must output structured JSON guidelines mapping potential player actions to specific environmental considerations and system modifiers.  
  * *Example Output:* "If players breach the outer airlock (Condition), apply Vacuum Hazard Overlays to the Tactical Map (Action) and trigger a DC 15 Reflex Check for all characters within 4 squares to avoid decompression drag (Modifier)."

### **3.3 Low-Latency UI Streaming (SSE)**

* **Directive:** Configure all AIME Genkit flows that generate long-form prose or continuous dialogue to return Server-Sent Events (SSE).  
* **Execution:** Hook these streaming text chunks directly into the React frontend. The stream must iteratively paint text inside the CommLink Quick Dock (for NPC chat) and the Story Weaver floating toolbar (for text expansion/polishing). Target a strict Time to First Byte (TTFB) of \<500ms to maintain the illusion of real-time AI typing, utilizing optimistic UI updates where necessary.

## **Phase 4: Retrieval-Augmented Generation (RAG) Architecture**

To give the AI agents complete, token-efficient mastery over the 14 Omnicortex collections, the system must utilize a highly optimized dynamic vector retrieval pipeline.

### **4.1 Semantic Chunking & Vertex AI Integration**

* **Directive:** Write a Node.js CodexIngestionEngine pipeline that parses the markdown rulebooks, PDF content, and tabular data.  
* **Execution:** Apply overlapping semantic chunking. Critically, the chunker must be "table-aware" (parsing Markdown Pipe Tables and TSVs) ensuring that complex tabular row data (like the Armor Coverage Matrix) never gets separated from its column headers in the chunk array. Route these sanitized chunks through Google Cloud Vertex AI using the text-embedding-004 model to generate high-fidelity 768-dimensional vectors.

### **4.2 Firestore K-Nearest Neighbor (KNN) Indexing**

* **Directive:** The terminal agent must generate and execute the exact gcloud CLI commands required to create a composite K-Nearest Neighbor vector index on the omnicortex collection group.  
* **Execution:** Program the Genkit flows to perform high-speed find\_nearest vector searches prior to answering any rules-based queries. The flows must utilize pre-filtering (e.g., WHERE category \== "cybernetics") before the vector search to narrow the RAG scope, injecting only the top-K canonical text snippets into the LLM context window.

## **Phase 5: Security, Observability, and RAGAS Validation**

The final phase secures the cloud infrastructure for live, multiplayer production, preventing unauthorized API exploitation and setting up continuous quality assurance.

### **5.1 Cloud Functions Security & Firebase App Check**

* **Directive:** Wrap all exported Genkit flows in onCallGenkit wrappers secured by standard Firebase App Check (enforceAppCheck: true).  
* **Execution:** Extract the context.auth token within every flow. Validate the user's role. Implement strict gating: ensure only users possessing the Architect (Game Master) privilege flag in Firestore can trigger destructive state mutations (like deleting a scenario tree or wiping an NPC), while Operators (Players) can only trigger queries and token movements related to their assigned Persona Folio.

### **5.2 Genkit Telemetry Integration**

* **Directive:** Install and initialize the @genkit-ai/firebase telemetry plugin to monitor production health.  
* **Execution:** Export execution spans to Google Cloud Operations. Create custom monitoring dashboards to track genkit/flow/latency and track input\_tokens vs output\_tokens consumption per player session. Set automated billing alerts if a specific campaign session exceeds predetermined LLM utilization thresholds.

### **5.3 Automated RAGAS Framework Testing**

* **Directive:** Construct automated CI/CD testing pipelines based on the RAGAS (Retrieval Augmented Generation Assessment System) metrics before deploying any flow updates.  
* **Metrics:**  
  * **Context Precision:** Verify that vector searches return the exact required rules at the top of the stack (e.g., querying "Zero-G movement" must return the precise rules from Chapter 11.1).  
  * **Faithfulness:** Mathematically ensure BASTION does not hallucinate scaling multipliers or BP costs. If a Heavy MBT (20x scale) shoots a standard infantryman (1x scale), the RAGAS test must assert that the AI correctly calculated the 20x overkill damage modifier.  
  * **Answer Relevancy:** Ensure AIME's narrative prose stays strictly aligned with the active scenario tree context, preventing the AI from introducing fantasy tropes into the cyberpunk/sci-fi setting.

# **Tab 3**

TANGENT AI Integration \- Active Plan & Workspace Manifest  
This document serves as the persistent, sandbox-style active workspace manifest to prevent "Context Window Compaction Amnesia" and keep track of development workflows.

# **1\. Global Objectives & Core Constraints**

* **Global Goal**: Bridge tightly authored narrative generation (AIME) with deeply simulated mathematical game states (BASTION) using Firebase Genkit and Google Antigravity.  
* **Core Constraints & Guardrails**:  
  * **The Increment Rule**: Never bypass the Increment Rule. No generated advancement logic may apply more than a single point to an ability score or skill rank per experience award.  
  * **State Integrity**: All in-game modifications must go through the pure, deterministic **Plan-Diff-Validate-Apply (PDVA)** pipeline. Prose cannot directly alter database states.  
  * **Transport Limits**: Use the local STDIO Model Context Protocol (MCP) transport for local development, and Streamable HTTP for production to keep latency under 10ms.

# **2\. DAG Workflow State (To-Do & Done Tracking)**

Use this area to track the Directed Acyclic Graph (DAG) task states.

* **\[x\] Done** | **\[/\] In Progress** | **\[ \] To-Do**  
  |---|

## **Milestone 1: Development Infrastructure & Skills Setup**

* **\[ \] Task 1.1**: Author custom workspace skill `tangent-mechanics-validator.md` in `<workspace-root>/.antigravity/skills/`.  
* **\[ \] Task 1.2**: Define STDIO-based local MCP server configuration.

## **Milestone 2: Firebase Genkit Runtime & Schema Validation**

* **\[ \] Task 2.1**: Define BASTION `WeaponAssetSchema` in Zod to enforce strict output formatting.  
* **\[ \] Task 2.2**: Write `onCallGenkit` serverless functions wrapping BASTION/AIME flows.  
* **\[ \] Task 2.3**: Enable Firebase App Check attestation for callable endpoints.

## **Milestone 3: Vector Indexing & RAG Pipeline**

* **\[ \] Task 3.1**: Run Vertex AI `text-embedding-004` ingestion for the Omnicortex rules compendium.  
* **\[ \] Task 3.2**: Execute `gcloud` CLI composite index command to build the Firestore vector index.  
* **\[ \] Task 3.3**: Validate Context Precision metrics via evaluation scripts.

## **Milestone 4: Narrative Engine & Telemetry**

* **\[ \] Task 4.1**: Set up AIME's Server-Sent Events (SSE) streaming API endpoints.  
* **\[ \] Task 4.2**: Configure OpenTelemetry tracing and integrate with Google Cloud Trace metrics.

# **3\. Active Workspace Scratchpad**

*This area is reserved for the active agent to dump volatile terminal logs, current file focus, and temporary context.*

* **Active Worker Focus**: File  
* **Discovered Dependency Files**: File  
* **Active Terminal Output / Errors**:

\[Insert recent logs or output here\]

# **4\. Operational Best Practices**

* **Write-Ahead Logging**: Always edit this manifest *before* performing any high-risk file writes or system executions.  
* **Strict Role Boundaries**: Only the supervisor agent can edit this manifest. Worker agents are restricted to task namespaces.  
* **Recursion Limits**: If a worker or supervisor reads a file more than 3 times without moving a task from `[ ]` to `[/]` or `[x]`, halt operations and force a manual checkpoint.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAaCAYAAAAe97TpAAAB6klEQVR4Xu2VMUgcQRSG/xDFiBoxiEGIoGAjESzEBBEhkAQJQQsRbMRObNIFBBvRSqwEKxuRWIkIYhUC6VIkEAsVJWAlooUIgQQULEL8f2bHmxtv7/buVjhxP/i4u5m525k3770DEhLuHQ/pA3/wLvCYTtAT+j9wnla5i0qZLnpAZ+lrOkRXYA7yzllXsjynZ3TaG1c6XdJubzw2yul32hO8L4ZPMBFfRoG/pTyco3v0I6L9iNYswhRfHAzQfzAH2aQt6dPZqaZf6CTMhrYQLf/ewhwiLpQ2w/QPUgW9Rp+5i8J4Q09pe/BZ0Xh1PRuOiu828lRdSN3pAuYgqpOc9MMsVirpy7Xp0xnR7a3TMZgOksn3iNYWm2gfrfTGm+lPmL35czfQde0gdYWqiVzEdYhBmPT5gMx/arppdaZGf8JFxfmEVsC0uCmY09e5i0IoNp3q6T79Rmu8OYsCfEwf+RMWTWzQv7TDGf+K3BEUxRZ2Jz0PfOnNWUbob3/QRZFQHawiVQd61RejUEYXUHiL1bN+wKTwEUxd2NauAI/SQ0TolON0my4F7iK/Temhn2kvslx5FtroL6Tq0aoOqf1Eaq9CG3lKG5DfASzqLjMwwVBErfq/aXXWhaFn6jC2IbxAYQFJSEhISEhI4wrexFi4dJxuwQAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAZCAYAAADOtSsxAAADqUlEQVR4Xu2ZW4hNURjHP6Hcr5NLKMSDkAdJihBC4gHlAS88SClFLnnQSFIuL+6XJAp5VMOTGLwoHigipSjlQRJRJJf/zzprzjpr9jmz90wz5xztf/2bc9a3Zu9vre/7/t/a+5jlyJEjR44KGCheEBfHhhoD/p0U+8aGekU3cad4XewZ2bqLw8Td4trIVk3gJ/7iN/7XNSaLr8VZsSHAMXFaPFhl4C9+439do1FsFvuVDrdgsPio8LeWgL/N5vyvW/jN3RMbAkwXv8WDNYID1s7kGCDuE5vEqeI8sSGc0EVgc7+IS2NDgE3in8Ln3uIOc6XP4uOeUQnM3Sw+KXCVeM3ctfYW7FmB358sozyiXe/EreJE8ZW5Ba4MJyVggbg6A5nf1qKWm8tuApEEGtwV8aM4Qjwvzrfixo0sTq0I/DgubjTX2OeY27iZ4hbxu7iwZXZ6+OpkHalAw/ggXrTi5lwyt8BJflIZdEYAdolvrfxGNojPzWntaXNBINuomofmjq5psMRclvsTi78G139qbk/a00zHi+/FbbEhCT3MZc5PcXZhrL/4oEA+dzXaCgB+4i+L9JvNJg4Ve/lJKUByjQq+c6T1skYzDQ8AzD0lnhPHBONJwG/8Zx1tgguT6WHT8GMc86qBtgLg9Z9sfybOLTW3CwQQBSCo5YAcp0nKTAFA435b6WQc8fKzQtwf2GJ0hgRV6gHDzen8TXPZTpIgG8gHtstWTCR0nWrBFj8Y8d03X+z0wB/mmjgYJ56xYkXxhHvbig9+jJc7ImfqAdyI5utvjGO/zEWa8j5klR+GOgMzxK+WfAry8uMThl7lq2WdudOQB/9PpSQFE7lC52m62Egy5nJd35xJPg90nWDRE5aJJ8Q7gT0EG++TIhVw9I257Gk2t5DP4i3xqLk+0ZXwTTbpOQD5IVN9UhAQqrVJvGqlDZgKRlKo8DgbWZPfxBviYXP3IxlJvvVWWjUEA5neYC5gnJzuBfYQJHOWw8A/EHVK2JcVf8mSuHS7Co2W/CSMn/HCkAPeDSE5SUA24gAA37gHBWPcL0ki2VQCyQu3cr0J/BdPwiDNu6A0INPZtCmxIQO8/qMMi8QX5qS7TzipAJ4lXooTYkO9gews9zY0C9iQI9YxGfX6j6TBx+JYa33Ox0/83R6N1y2QGvR5TWxIiSHmsn90bMgITor3zfmD1N0VD1prWaNCODl1JGFqDiy62j/I0FtCuUnqQwTjrP1HP8jkyJEjR47OxV81V7OcFpf7ewAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAZCAYAAADaILXQAAABIUlEQVR4Xu2Uv0qCURjGH0mHQtLBsRuI3JyEGoXArcnZbkC6AK+hoTFwEkEUhBAcHaXLEKGhoakhMPV5eBHOOfIVer5o8Qe/4Xyv5z3P+YPAkT3J0Et6HhbS4IZ+0WeaDWrR9OkatkA1qEVxSu9gTdVcaiepUIMtoOPowXagneTcHx2Cmg6dcYV+0m/YolHcwm+u9LpUpX+BLX4QmjjCbsJU0usSlTpMpzf/hIj0eTpG8qso0w+6gh2dS522g28eSt1F8otQ+kdY+gn89Jr34Iw9fku95Yq+Yzf9K712xh4NuqQLOv9B1XWpSj+Fhbqnb7QD6+NRoDPYhH1Ueh2lGOAP/n+E7iLxvGMpwc77hJ4FtWguaIs2kfzSoiiGH478Dxtls0Nhpaa/TQAAAABJRU5ErkJggg==>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAbCAYAAACqenW9AAAA50lEQVR4XmNgGNrAFIj3APEjIL6AJocBeIBYH4ivA/FpNDmsQBOI3wLxHHQJbCAaiP9DabyAEYjnM0BMBtmAF4gA8VUgPgzEvECsBcT7GSDuN0BSBwag0PgGxJMYILZUAXEYEL8C4nIkdWCQzgBxbyAQFzBANIA8ChKLQFLHwALEa4D4HwPEWk+oOAcQCzNANMIBzL3PGSARAnION7ICZFDEADHVBcoHhQYsrHMYkIIS5oQHQCwNFTNmgHgK5ISlQCwLFYc7YTkDRCMIcALxDSDeAcQBUDE44AdiVjQxkKmg9DIKBjMAAA/LJd7+0F9mAAAAAElFTkSuQmCC>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF4AAAAaCAYAAAA+G+sUAAADe0lEQVR4Xu2ZS6hNURzGP6G85REJeWQilJKJmHgUySOE8kjkKoXyLpSJgZm88wgjBoykJHExIAwMSJFESpGJYiKP77v/vbrrLGfvs87e5z667V99nXvWWvvstb/9X//13/sCJSUlJSUZ9KU+U1+oQ0Ffe9CLugw7/0tqHdXTH9AV6U3dpGaEHR4yZnKionSnJlDdwg5Y2yrqN3Us+d5lGUV9ChsTdOHrYf0Hqe3UHuSLxn7ULOoxdT/5Xg21N1PPqEGVXZ2DEdQu6gn1MdAOb1wtplE/wkZYlN+iHlH9vfbrsHMO9Npi0Zw/wIytZbzGaXynQtH3lFoCM6gIacaPh+X9u7A9wHGF+klN99piaVPjB1NnqXewiBRTYEtnmxtUAC3zw8lnI0gzfib1C2a0zwXqL7UoaI+hzYzXQddgG9VKtF7QJthkm5MxRViGxpku0oyXsZpzaPy+pF2f9RJjvFaXVlldxs+nDsA2pZPUt6RdRl2C5cceSVsedOzFsLEAmudeWGSHdJTxQplCc1oedqQxkRpJjYNVAle9vg1onazGnabOUaPdgAg0Wd28FTWk389C6VBl2x3qDbWgsruFjjReJedmWKFwgpqDyFW+mvqTfDqOwvKmQykjrBhqEWu89pQsfONfUbMru1uYC7uG0PgjMOM1/3qJNV4mK+q/UucRabyWr9KKKgJVBmJ40uaXYLqA4973GJRqtHE3iqxUo1WjVNmMSpN0IzTeD6JYYo2vO9UItyv70byG2uIGoHUDUbtQSZg1EZ95iLj7dZC2ueqJ9jb+f5BRba9VMtRr05Oo5qVjsogxPtfmKtyDh5vwGOoMKqNdK+EFNYlaCNuI73n9Wcj0/bA82AjSjBdKJ99hT5wO7V2uTBZazSqdY/K+e0rOSrEucOs2Xkyl3sJOoPcgOqHPYtiN2Qi7cJWbDypGZKP08BBWRaVFTixZxusm62HtPdUEW6FKdX5k6+8bsP1A6bQaSk+6MdUU3qxCxgtF5DBUf9Gj/K6JnkLOH4cdp8ir9spgtzeuFlnGOxTVqnKWhh0eWsUqIIpS2Pg0XA5bC8uLr2HlZx9/UDsSY3wMquC2ho05aDPjXX5X1SA9p8ZSO70x7UnW28lYhsDSSZhS81CtOGkISkF+dCuP5nnT10gGwPK4SuDO8I8QvW5pVPFQUlJSUlJSUi//AKo2zDaMVggpAAAAAElFTkSuQmCC>

[image6]: <data:image/png;base64,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>