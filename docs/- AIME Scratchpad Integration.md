# **Tab 2**

# **Implementation Plan: CRONICLE Persistent Memory Architecture**

## **1\. Executive Summary and Architectural Philosophy**

This document serves as the comprehensive technical implementation plan for the **CRONICLE** state management and scratchpad system. The primary directive is to transition the interactive pair-author RPG engine from a highly volatile, transient, attention-based memory model into an externalized, persistent "Single Source of Truth."

As interactive narratives scale into tens or hundreds of thousands of words, traditional sliding-window attention mechanisms suffer from severe contextual drift and memory degradation. This degradation fundamentally stems from the LLM's architecture: as the context window saturates, the model experiences the "lost in the middle" phenomenon, prioritizing immediate recent dialogue over critical foundational constraints established hours prior. The result is a phenomenon colloquially known as "AI Slop"—generic, statistically average outputs that actively ignore established world-building constraints, hallucinates logic errors, and homogenizes character voices.

This robust architecture resolves this bottleneck through a deeply integrated Firebase NoSQL infrastructure, automated Natural Language Processing (NLP) state extraction pipelines, and hybrid high-dimensional vector retrieval. By mathematically compartmentalizing narrative variables into discrete, continuously evolving database documents (referred to as *evolutionary lore*), this system ensures absolute zero narrative degradation over infinitely long-horizon contextual windows. It transitions the generative LLM from a mere probabilistic text generator into a highly consistent, state-aware computational co-author that natively respects the complex parameters established in the AIME Element Forge modules.

## **2\. Infrastructure & Tooling Selection**

The technological stack has been carefully selected to balance high-speed read/write capabilities, semantic depth, and rigorous cost-management regarding API token overhead. We prioritize separation of concerns, ensuring that the heavy lifting of state management does not cannibalize the processing power or latency budget of the core generation loop.

* **Primary State Database:** Google Firebase (Firestore) \- Selected for its real-time WebSocket synchronization (onSnapshot), granular hierarchical document structures, and robust optimistic concurrency controls. Firestore natively supports the highly mutable nature of "evolutionary lore," allowing for instantaneous state updates without monolithic file parsing. Alternative SQL databases were rejected due to their rigid schema requirements, which poorly map to the highly dynamic, unpredictable trait additions of an RPG environment.  
* **Semantic Database:** Pinecone, Milvus, or pgvector \- Utilized to store and retrieve high-dimensional text embeddings. While the NoSQL layer handles explicit, rigid state (e.g., HP values, specific inventory items, explicit faction allegiances), the vector database is strictly reserved for surfacing thematic resonance, obscure historical antecedents, and emotional continuity through cosine similarity queries.  
* **Extraction Layer:** A secondary, highly cost-efficient NLP model (e.g., Gemini 3 Flash). This model is heavily fine-tuned to function exclusively as a deterministic logic parser. It does not generate creative prose; instead, it is strictly tasked with entity recognition, comparative analysis, and mapping unstructured prose into structured JSON delta-events.  
* **Generative Layer:** Primary LLM (e.g., Gemini 3 Pro) for the overarching prose treatment. This model handles the nuance, pacing, and stylistic execution. Because the CRONICLE system offloads the burden of maintaining absolute long-term memory, the primary LLM's entire token budget and attention capacity can be focused purely on maximizing prose quality and scene-level logic.  
* **Development Platform:** Google Antigravity 2.0 \- Leveraging advanced multi-agent orchestration to rapidly construct, test, and deploy the complex backend architecture in parallel, specifically utilizing autonomous subagents to write complex database rules and extraction prompts.

## **3\. Database Schema Implementation (Firebase)**

The foundational requirement of the CRONICLE architecture is structuring the NoSQL document database to seamlessly support the highly specific functional divisions of the AIME Element Forge modules (Persona Maker, World Anvil, Story Weaver). Storing the game state as a single JSON blob is expressly forbidden due to concurrency risks and massive token retrieval bloat.

**Action Items & Schema Definitions:**

1. **The Working Copy Protocol (Source Element Preservation):** To ensure that base lore templates (source ELEMENTS) can be reused across multiple independent stories without contamination, the system must execute a mandatory cloning operation at the onset of a new campaign. Any base file utilized must be duplicated as a "working copy" and explicitly prefixed with the active story name (e.g., \[story\_name\]\_location\_citadel). The engine is strictly programmed to only read from and mutate these prefixed working copies, guaranteeing the original source files remain pristine for future campaigns.  
2. **Initialize Firestore Collections:** Establish the root hierarchy utilizing the pattern /campaigns/{campaign\_id} to ensure strict tenant isolation between different pair-author sessions.  
3. **Define Strict TypeScript Interfaces for Narrative Units:**  
4. The schemas must support dynamic appending while maintaining type safety.  
   * **The Persona Maker (/personas/{story\_name}\_{character\_id}):**

interface PersonaState {

  id: string; // e.g., "shadows\_of\_elaria\_elara\_npc"

  base\_physical\_stats: { str: number; dex: number; int: number; };

  active\_inventory: string\[\]; // Array of item IDs

  relationship\_matrix: Map\<string, number\>; // e.g., {"faction\_guild": \-50, "king\_aethelgard": 85}

  dynamic\_psychological\_traits: string\[\]; // e.g., \["paranoid", "grieving\_loss"\]

  acquired\_physical\_traits: string\[\]; // e.g., \["scarred\_left\_eye", "poisoned"\]

}

* &nbsp;  
  * **The World Anvil (/world/{story\_name}\_{location\_id}):**

interface LocationState {

  id: string;

  current\_geospatial\_state: "thriving" | "under\_siege" | "ruined" | "rebuilding";

  economic\_modifiers: string\[\];

  environmental\_hazards: string\[\]; // e.g., \["acid\_rain", "magical\_fallout"\]

  occupant\_lists: string\[\]; // IDs of personas currently here

}

* &nbsp;  
  * **The Story Weaver (/story\_weaver/timeline):** An immutable, ordered, and timestamped collection. Each document represents a completed scene or narrative milestone, containing a compressed summary and an array of involved\_entities.  
5. **Concurrency Controls and Security Rules:** Implement strict Firestore Transactions. In a dynamic pair-author environment, a race condition is highly probable: the background AI extraction layer may attempt to deduct an item from an NPC's inventory simultaneously as the human user manually alters that NPC's traits via the UI. Transactions guarantee atomicity, automatically triggering a retry or flagging a conflict for reconciliation if the underlying document changes during a write operation. Role-Based Access Control (RBAC) rules will be enforced at the database level to prioritize explicit human edits over automated system writes, enforcing the "human-as-sculptor" philosophy.

## **4\. The Context Injection Pipeline (Asset Hub)**

This phase establishes the algorithmic methodology for how the primary generative LLM retrieves and comprehends the world state prior to drafting prose. We must mathematically prevent context bloat while ensuring pinpoint accuracy, artificially elevating the probability of lore-accurate token generation.

**Action Items:**

1. **Dynamic Context Fetching Logic:** Develop a targeting algorithm utilizing graph traversal techniques. If the current scene explicitly features "Character A" in "Location B," the system must exclusively pull the documents for those exact entities (using their story-prefixed working copies). Blind, monolithic database dumps are structurally prohibited.  
2. **Guidance Gem Formatting & Serialization:** Build a serialization utility that intercepts raw, nested JSON payloads from Firestore and computationally translates them into "Guidance Gems." LLMs process natural language constraints better than raw JSON arrays.  
   * *Raw JSON:* {"relationship\_matrix": {"king\_aethelgard": \-100}}  
   * *Guidance Gem Translation:* *"CRITICAL CONTENT RESTRAINT: The character is currently viewed as an enemy of the state by King Aethelgard. Interactions with royal guards must reflect extreme hostility."*  
3. **Strict Token Budgeting Mechanism:**  
4. To prevent the "lost in the middle" phenomenon, we implement a strict token economy (e.g., capping context injection at exactly 4,000 tokens per prompt).  
   * *Tier 1 (Mandatory \- 50% of budget):* Exact current location tags, active character statuses, physical injuries, and the immediate quest objective. Injected almost verbatim to constrain immediate physical logic.  
   * *Tier 2 (Relevant \- 30% of budget):* Relationship matrices specifically between the present entities, and the immediate 3 previous chronological timeline events from the Story Weaver.  
   * *Tier 3 (Flavor \- 20% of budget):* Distant historical world states. If the token limit is approached, the system will route Tier 3 data through a rapid summarization module (via the Gemini Flash model) to condense it before injection, or drop it entirely if statistically irrelevant to the active scene parameters.

## **5\. NLP State Extraction & Mathematical Transitions**

The system must operate continuously in an iterative loop, automatically deducing state changes from the generated prose and writing them back to Firebase as discrete data deltas without requiring manual human data entry. This is the most computationally complex portion of the CRONICLE system.

**Action Items:**

1. **Asynchronous Message Queue Infrastructure:** Implement a robust background worker architecture (e.g., Google Cloud Tasks, Celery/Redis). The extraction pipeline is computationally heavy. By decoupling this from the main user-facing React thread, we guarantee zero UI latency. When the human author clicks "Accept Generation," the UI instantly unlocks for their next prompt, while a payload is securely dispatched to the Cloud Tasks queue to update the database silently in the background.  
2. **Delta Event Extractor:** Prompt-engineer and few-shot train the secondary NLP model (Gemini Flash). It must analyze the accepted prose against the previously known state, and output a structured JSON of delta events targeting the prefixed working copies.  
   * *Narrative Input:* "Elara swung the cursed blade, shattering the goblin's wooden shield into splinters before driving the sword home."  
   * *Extracted JSON Delta:* \[{"entity": "\[story\_name\]\_goblin\_01", "action": "remove\_item", "target": "wooden\_shield"}, {"entity": "\[story\_name\]\_goblin\_01", "action": "update\_status", "target": "deceased"}\]  
3. **State Transformation Engine:** Programmatically execute the calculated transformation using the following deterministic state equation:  
4. $$S\_{t+1} \= E(S\_t)$$  
   * $S\_t$: The baseline established entity state pulled from Firebase at the start of the turn (e.g., the goblin has a shield and is alive).  
   * $E$: The transformation function—the explicit delta event mathematically extracted by the NLP pipeline.  
   * $S\_{t+1}$: The newly computed, consequential state irrevocably pushed back to the Firebase NoSQL document (the goblin is dead, shield removed from the world state).

## **6\. Hybrid Semantic Memory (Vector Database Integration)**

Rigid NoSQL queries are exceptional for tracking exact integers (like currency) or binary states (alive/dead), but fundamentally fail to capture thematic resonance, nuanced foreshadowing, or complex narrative antecedents. A character might reference a vague prophecy from Chapter 1 during Chapter 50; a standard NoSQL query will miss this unless exact keywords match. The system must implement a dual-pipeline approach to bridge this gap.

**Action Items:**

1. **Automated Embedding Generation:** Establish a Firebase Cloud Function listener on the /story\_weaver/timeline collection. Whenever a new episodic milestone is logged to the database (Stage 2 completion), this function will automatically ping an embedding API (e.g., Google's text-embedding-gecko) to generate a dense, high-dimensional vector representation of the scene's summary, storing it in Pinecone alongside the Firestore document ID.  
2. **Cosine Similarity Search:** During Stage 1 (Context Injection), the engine will embed the user's current prompt or active scene parameters. It will execute a rapid cosine similarity query against the vector database to retrieve the top-k most semantically aligned historical nodes.  
3. **Injection Synthesis:** The prompt assembly module will seamlessly synthesize these retrieved semantic memories with the explicit, rigid Firebase parameters. For example, the prompt will receive the rigid NoSQL data ("Character is in the Citadel") AND the vector data ("Retrieve thematic memory: The character's father was assassinated in this exact Citadel ten years ago"). This delivers a profoundly robust, multidimensional system prompt to the generative LLM, enforcing emotional continuity.

## **7\. UI Integration & Human Oversight Protocols**

Automated algorithmic extraction introduces the systemic risk of the AI misinterpreting its own generated prose (e.g., mistaking a metaphor about "losing one's head" for a literal decapitation). The core philosophy of "AIME Craft" demands that the human user remains the ultimate, unassailable "sculptor" of the narrative architecture.

**Action Items:**

1. **Real-Time SyncListeners:** Utilize Firebase's native onSnapshot WebSockets to instantly and silently push backend database updates to the frontend React state. As the background NLP queue processes data, the UI will reflect changes without requiring page reloads.  
2. **The Floating Toolbar Component:** Develop a non-intrusive, context-aware React component. When the state transition engine ($S\_{t+1}$) registers a change, the UI will display a subtle, color-coded notification badge on the periphery of the text editor. The user can click this badge to inspect a clear, human-readable list of exactly how the AI interpreted the recent prose (e.g., "AI logged: Elara gained trait 'Injured Leg'").  
3. **Strict Manual Override Logic:** Architect the frontend to allow the user to instantly modify, accept, or permanently delete the AI's proposed database updates with a single click. Furthermore, any data modified manually by the human author via this graphical interface mathematically takes non-negotiable precedence over AI-extracted deltas. This guarantees absolute authorial control and provides a fail-safe against logic loops or algorithmic drift.

## **8\. Google Antigravity 2.0 Execution Strategy**

To transition this complex architectural theory into functional, production-ready code rapidly, we will heavily leverage the agentic workflow capabilities of the Google Antigravity 2.0 environment, orchestrating multiple subagents to handle distinct layers of the stack.

* **Dynamic Subagents via YAML Configurations:** We will compartmentalize the build process by defining highly specialized subagents in our YAML configuration files.  
  * @db-architect (configured with subagent: true, focused on TypeScript and NoSQL) will be dispatched autonomously to write the precise Firestore schema interfaces, implement the Working Copy cloning logic, define indexing policies for complex queries, and construct the rigorous RBAC security rules to prevent race conditions.  
  * @nlp-pipeline will be exclusively tasked with engineering the extraction prompts. It will iteratively test the Gemini Flash logic parsing capabilities against a suite of synthetic narrative edge-cases (e.g., sarcasm, metaphors) and wire the Google Cloud Tasks background queue integration.  
* **Asynchronous Task Management & TDD:** We will utilize Antigravity's autonomous testing modules to execute long-running compilation scripts and Firebase emulator test suites asynchronously. This ensures that the primary workspace remains unblocked while the agents aggressively stress-test the concurrent transaction logic and ensure the $S\_{t+1} \= E(S\_t)$ math holds up under load.  
* **JSON Hooks and Verification:** We will implement discrete JSON hooks within the Antigravity configuration. These hooks will intercept the agent's logic precisely during the critical prompt-assembly phase of the Context Injection pipeline. This allows the human developer to manually verify the token-budgeting algorithm's mathematical outputs and inspect the generated "Guidance Gems" before the code is permanently committed to the main branch.  
* **Comprehensive Artifact Generation:** Before writing the underlying code for each subsystem (e.g., the Vector DB hybrid search), the agent will be instructed to produce highly detailed Walkthrough and Schema Blueprint artifacts. This layered approach ensures absolute conceptual alignment with the original AIME Scratchpad Integration Architecture before runtime execution begins.

&nbsp;

# **Tab 1**

# **Architectural Paradigms for Persistent Memory and Contextual Scratchpads in Pair-Author Interactive Narrative Systems**

## **Introduction to Long-Horizon Narrative Continuity**

The development of pair-author chatbot architectures for Role-Playing Game (RPG) engines represents a frontier in human-computer collaborative design, necessitating sophisticated frameworks for memory and state management. As interactive story platforms evolve to handle increasingly granular and lengthy narratives, a fundamental limitation of autoregressive Large Language Models (LLMs) emerges: the degradation of narrative consistency over extended context windows. While contemporary foundational models boast expansive token limits, the underlying attention mechanism inherently struggles to appropriately weigh discrete, early-context variables against the overwhelming mass of recent dialogue or prose. This architectural bottleneck demands that systems externalize memory, transitioning from transient context reliance to dynamic, stateful database management.

Within the specialized parameters of the AIME ecosystem, this externalized memory structure is explicitly conceptualized as the CRONICLE file, which may also operate as a synchronized set of chronicles. This paradigm relies on establishing a definitive "Single Source of Truth" that continuously updates as the narrative develops, operating similarly to a highly dynamic, computable version of static world-building documents1. By integrating a dedicated scratchpad architecture backed by a real-time database infrastructure such as Firebase, the pair-author engine can programmatically inject, update, and refine narrative states. This comprehensive analysis details the theoretical foundations, architectural schemas, and integration workflows required to design a chatbot scratchpad capable of maintaining absolute consistency in an evolving, high-granularity interactive fiction environment.

## **The Theoretical Foundations of the LLM Scratchpad**

The terminology surrounding the "scratchpad" in computational linguistics and LLM architecture originally referred to intermediate processing spaces where models could output chain-of-thought reasoning before arriving at a final deterministic answer. This technique effectively expanded the computational capacity of the model by allowing it to use tokens as a form of temporary working memory. However, in the domain of interactive narrative and pair-authoring, the scratchpad concept is fundamentally adapted from an intermediate reasoning tool into a persistent, read-write memory state.

### **Overcoming Attention Degradation and Contextual Drift**

In lengthy RPG campaigns, the sheer volume of generated prose rapidly exceeds the effective working memory of the underlying language model, regardless of the theoretical maximum token limit. When generative engines rely solely on sliding window attention methodologies, wherein the oldest text is continuously discarded to make room for new inputs, they become highly susceptible to a phenomenon colloquially termed "AI Slop"1. This degradation is characterized by generic output, hallucinated continuity errors, the homogenization of specific character voices, and a general loss of logical consequence. A character might inexplicably forget a grievous injury sustained ten chapters prior, or a town previously described as utterly destroyed might be dynamically repopulated in subsequent generations due to the model defaulting to probabilistic baseline averages rather than specific historical constraints.

The scratchpad architecture systematically mitigates this degradation by abstracting the raw narrative prose into distinct, semantic data points. Instead of demanding that the model scan hundreds of thousands of words of previous text to remember the state of the world, the engine provides the model with a compressed, continuously updated summary of essential truths. This methodology transitions the burden of memory from the neural network's attention heads to an external deterministic database.

### **Memory Typology in Interactive Fiction**

To comprehensively understand the role of the CRONICLE scratchpad, it is necessary to categorize the distinct types of memory operating within a complex pair-author system. Human cognitive architecture partitions memory into functional domains, and high-fidelity generative systems must replicate this partitioning to achieve coherent long-term performance.

| Memory Tier | Architectural Equivalent | Functional Characteristics within the Pair-Author Engine |
| :---- | :---- | :---- |
| **Short-Term Memory** | The Active Context Window | Manages the immediate dialogue, the current scene being drafted, and the user's most recent prompt. This tier is highly volatile, continuously shifting with each generation cycle, and relies entirely on the immediate token payload. |
| **Working Memory** | The Asset Hub & Context Injection | Comprises relevant data pulled dynamically from the database specifically tailored for the current scene. It acts as the immediate structural constraint, providing the immediate elements required for the active generation without overloading the context. |
| **Long-Term Episodic Memory** | The Story Weaver Logs | Functions as a sequential, immutable record of events that have occurred. It tracks the macro-level plot progression, completed milestones, and chronological alignments to ensure the timeline remains rational. |
| **Long-Term Semantic Memory** | Persona Maker & World Anvil States | Stores the abstracted "truths" and laws of the simulated world. This includes complex character sheets, relational webs, environmental conditions, persistent items, and faction allegiances that dictate the rules of the narrative reality. |

The CRONICLE functions as the absolute repository for both long-term episodic and long-term semantic memory, seamlessly bridging the gap between historical narrative events and the current generative task. It ensures that the episodic timeline informs the semantic reality, creating a cohesive foundational layer upon which the short-term generation can operate.

## **The CRONICLE Architecture within the Ecosystem**

The AIME guidelines delineate a highly sophisticated framework designed specifically to support granular, consequential storytelling over extended horizons. Within this framework, the CRONICLE is not merely a supplementary text file appended with developer notes; it is a highly structured, relational data object that explicitly mirrors the functional divisions of the engine's Element Forge Modules1. By treating the CRONICLE as the definitive "lore bible," the system programmatically guarantees that every newly generated token is anchored to the established reality of the game world1.

### **Granular Categorization of Narrative State**

To maintain absolute consistency across tens or hundreds of thousands of words, the CRONICLE must automatically partition updates into highly specific, computable categories. The AIME ecosystem utilizes the Element Forge to govern these partitions, ensuring that different types of narrative data are handled with appropriate data structures and retrieval algorithms1. This structural rigidity is paramount for efficient database querying and prompt formulation.

#### **The Persona Maker: Dynamic Entity Tracking**

Character consistency remains the most critical vector for user immersion in RPG engines. The Persona Maker subdivision of the CRONICLE tracks the dynamic, continuous evolution of discrete entities within the narrative world1. This tracking extends far beyond static physical descriptions established at character creation. As the narrative logically progresses, the underlying database must computationally record shifting psychological and physical states.

A character's primary motivation may organically shift from a simplistic desire for revenge to a complex obligation to protect a newly formed political alliance, based entirely on the outcomes of previous scenes. The system must also quantify and continuously update relational matrices, establishing the affinity, hostility, or complex diplomatic ties between the protagonist, Non-Player Characters (NPCs), and broader factions. Furthermore, acquired physical traits and injuries must be recorded. If a character acquires a cursed item or sustains severe trauma during a specific encounter, these elements must be logged as persistent tags within the Persona Maker record, ensuring that future interactions algorithmically account for these acquired vulnerabilities or powers.

#### **The World Anvil and Setting Architect: Environmental Permanence**

Environmental permanence ensures that the simulated world reacts logically and consequentially to the narrative progression. If a pair-author session dramatically concludes with the destruction of a major metropolitan hub or the fundamental alteration of a pervasive magical law, the World Anvil section of the CRONICLE must instantly and permanently reflect this new reality1.

This comprehensive tracking encompasses geospatial states, dictating the current operational condition of locations, ranging from prosperous and expanding to ruined or under siege. It additionally monitors atmospheric and temporal variables, tracking the rigorous progression of in-universe time, changing seasonal cycles, and active weather patterns that might structurally influence scene generation parameters. Finally, the Setting Architect tracks socio-political climates, mapping shifts in power dynamics, economic depressions, or cultural paradigms resulting directly from the actions of the players or the generative narrative engine.

#### **The Story Weaver: Episodic Sequencing**

To mathematically prevent the narrative from meandering into formless generation or actively contradicting the overarching plot architecture, the CRONICLE integrates deeply with the Story Weaver module, specifically during Stage 2 outlining processes1. This component acts as the definitive episodic memory of the system.

The Story Weaver subdivision maintains a strict, sequential log of completed plot points, serving as a compressed, highly efficient historical timeline1. It tracks active quest lines and objectives currently being pursued by the entities within the world, ensuring the AI model maintains forward narrative momentum in its generative cycles. Crucially, it establishes and reinforces logical antecedents, ensuring that any future plot suggestions generated by the system align perfectly with the historical trajectory and established causal chains of the campaign1.

### **The Evolutionary Lore Paradigm**

Traditional interactive fiction and rudimentary generative games often rely on static .universe files, which act as large, immutable dictionaries of lore loaded entirely at the initiation of a session. While highly effective for preliminary world-building and establishing baseline rules, static files cannot support the dynamic requirements of the "AIME Craft" methodology. This advanced approach explicitly demands that every new action, dialogue choice, and physical alteration is irrevocably tethered to a developing, consequential world history1.

Consequently, the CRONICLE represents a fundamental architectural shift toward an *evolutionary lore* paradigm. In this advanced computational model, state files such as .persona and .world are constructed as highly mutable documents1. They are not read-only encyclopedias but active, read-write databases continuously modified by the state transitions of the narrative. This evolutionary approach necessitates a highly robust backend infrastructure capable of rapid, granular updates, which natively aligns with the capabilities of a NoSQL document database environment.

## **Database Integration Strategy: Leveraging Firebase**

Firebase, and specifically its Firestore NoSQL document database iteration, provides an optimal, highly scalable infrastructure for the CRONICLE scratchpad architecture. Its real-time synchronization capabilities, hierarchical data structuring schemas, and document-level granularity map seamlessly onto the rigid requirements of the AIME Element Forge modules. Developing a structural design that ensures efficient data retrieval, minimizes latency, and maintains semantic separation of narrative elements is critical to the system's performance.

### **Structuring NoSQL Collections for Granular Narrative Units**

To seamlessly align with the Scene Builder module, which algorithmically breaks narratives into the smallest possible computable units, the Firebase database schema must be equivalently granular1. Storing the entirety of the CRONICLE as a single, monolithic JSON document would inevitably lead to severe concurrency collisions, unmanageable data payloads, and excessive, costly token usage during the retrieval phase. Instead, the narrative state data must be efficiently distributed across deeply interconnected collections.

| Firebase Primary Collection | Subcollections and Standardized Document Structures | System Function and Purpose within the Engine |
| :---- | :---- | :---- |
| /campaigns/{campaign\_id} | Metadata attributes, current\_active\_timestamp, global\_entropy\_settings, active\_participants. | Serves as the foundational root node and primary identifier for a specific, isolated pair-author story instance. |
| /campaigns/{id}/personas/{character\_id} | base\_physical\_stats, active\_inventory, relationship\_matrix, dynamic\_psychological\_traits. | Operates as the runtime storage and retrieval mechanism for the Persona Maker updates and entity states. |
| /campaigns/{id}/world/{location\_id} | current\_geospatial\_state, occupant\_lists, historical\_event\_tags, environmental\_modifiers. | Functions as the runtime storage for the World Anvil and Setting Architect, governing environmental permanence. |
| /campaigns/{id}/story\_weaver/timeline | Ordered, timestamped documents representing mathematically completed scenes, chapters, or critical milestones. | Maintains the episodic log of consequential events, ensuring strict chronological and causal consistency across the narrative. |
| /campaigns/{id}/scratchpad/working\_memory | Ephemeral, highly volatile data configurations for the currently active scene, encompassing unresolved immediate conflicts. | Provides the immediate, short-term read/write space for the AI model during the active generative treatment phase. |

### **Handling Concurrency, State Synchronization, and Atomicity**

In a dynamic pair-author environment, architectural complexity scales rapidly because both the human creator (designated within the philosophy as the "sculptor") and the AI (the generative engine) frequently and concurrently attempt to alter the definitive narrative state1. For example, a scenario may arise where the AI autonomously generates prose indicating a secondary NPC has perished in combat, while the human user, exercising authorial override, simultaneously utilizes a graphical floating toolbar to adjust that specific NPC's relationship status or equipment loadout1.

Firebase's robust transaction processing system and optimistic concurrency controls are absolutely critical to resolving these asynchronous conflicts. By utilizing strictly typed transactions, the engine can mathematically ensure that state updates do not destructively overwrite one another. If the algorithmic extraction layer identifies a new narrative "truth" from the recently drafted prose, it stages the database update as a pending transaction. Concurrently, if the human author intervenes via the user interface, the Firebase real-time listener architecture instantly alerts the engine's core logic controller, forcing a programmatic reconciliation of the conflicting data matrices before the next generative cycle is permitted to commence. This guarantees database atomicity and preserves the Single Source of Truth.

## **The Integration Workflow: The Pair-Author Loop**

The true operational efficacy of the CRONICLE scratchpad relies not exclusively on its static storage capacity, but fundamentally on how seamlessly and imperceptibly it integrates into the continuous, iterative loop of human-AI co-creation. The AIME ecosystem defines a highly specific, multiphase staging process to manage this complex integration, structurally ensuring that the AI maintains deep contextual awareness without overriding or disregarding the human's ultimate authorial intent.

### **Stage 1: Precision Context Injection via the Asset Hub**

Before any autoregressive generative task is initiated by the LLM, the system must precisely orient the model within the established narrative reality. This crucial alignment is achieved through the Asset Hub, which acts as the computational staging ground for Context Injection1.

The first phase of this operation is targeted retrieval. The system queries the Firebase infrastructure for the specific data relevant only to the current scene's parameters. This process is strictly distinct from a blind, monolithic dump of the entire CRONICLE, a flawed approach that would instantly exceed token limits and dilute attention mechanisms. Instead, the engine utilizes highly targeted, optimized queries. If the active scene takes place in a location designated "The Ruined Citadel" and involves the protagonist interacting with an NPC named "Elara," the engine programmatically pulls only the specific World Anvil document mapping the Citadel and the specific Persona documents representing those two interacting characters.

Following retrieval, the engine initiates the formatting phase to generate "Guidance Gems." The raw JSON data retrieved from the Firebase nodes is programmatically compiled into Guidance Gems, which are natural language summaries or highly structured, rigid bullet points that the underlying LLM can optimally parse and weigh1.

The final phase of Stage 1 is prompt assembly. The engine constructs a comprehensive system prompt that explicitly defines the established Elements and rigidly constrains the generative latent space. A structural example of this assembly involves system directives dictating the specific state of the environment and the precise psychological dispositions of the entities present, drawn directly from historical interactions logged in the database. This precise Context Injection methodology ensures that the Story Weaver module treats all previously documented developments as immutable, established truths before algorithmically generating a single new token1.

### **Stage 2: Narrative Synthesis and Algorithmic State Extraction**

During the drafting stage, technically referred to within the documentation as the "Treatment," the AI engine utilizes the previously provided structural outline and the explicitly injected Elements to autoregressively generate the narrative prose1. This generation represents the core interactive experience for the user. However, the true technical innovation and complexity of the dynamic scratchpad concept occurs immediately subsequent to the generation of the prose.

To mathematically maintain the "scratchpad" as a living, accurate document, the system architecture must automatically identify when the narrative state has materially changed during the generation phase and subsequently update the Firebase records to reflect these new realities1. This imperative requires the implementation of an intermediate, highly sophisticated layer of Algorithmic Extraction.

#### **The Natural Language Processing Extraction Pipeline**

When a distinct block of narrative prose is generated and subsequently accepted by the human user within the pair-author ecosystem, the raw text is seamlessly passed through a secondary, hidden Natural Language Processing (NLP) pipeline. This secondary process, often utilizing a smaller, highly tuned extraction model, is tasked strictly with entity recognition and state delta extraction. The engine computationally analyzes the accepted text specifically searching for "delta events," which are defined as concrete changes in the established narrative state1.

The operational mechanics of this pipeline rely on comparative state analysis. The extraction model evaluates the generated prose against the known baseline variables. For instance, if the generated text describes a protagonist severing an antagonist's limb and acquiring a specific artifact, the algorithmic extraction layer parses this raw text into structured data payloads. It identifies the entities involved by cross-referencing the active Persona Maker IDs. It then registers the delta events: appending an "amputee" physical trait to the antagonist's database record, updating the antagonist's relational matrix to reflect extreme hostility, and transferring the item ID of the artifact from the antagonist's inventory array to the protagonist's inventory array or the environmental floor state.

Once these specific delta events are computationally identified, validated, and structured, the system formulates a standardized JSON payload and executes a highly optimized write operation to the respective Firebase collections. This operation silently updates the CRONICLE in the background, fundamentally altering the Single Source of Truth. This guarantees that during the calculation of the subsequent scene, the injected Guidance Gems will accurately reflect the newly altered physical and relational states without requiring any manual data entry from the human author.

### **Stage 3: Refinement, UI Integration, and Human Oversight**

While sophisticated algorithmic extraction provides powerful automation, relying exclusively on automated background updates introduces a severe systemic risk: the AI engine misinterpreting the semantic nuances of its own generated prose. The foundational philosophy of "AI Craft" explicitly posits that the human creator must definitively remain the ultimate "sculptor" of the narrative architecture1.

To technically facilitate this crucial oversight, the newly updated CRONICLE data must be transparently exposed to the user through intuitive, non-disruptive User Interface (UI) elements. When the Firebase backend successfully registers a state update via the algorithmic extraction pipeline, the system architecture should automatically trigger subtle notifications or visual indicators directly within the Element Forge modules or via a specialized graphical floating toolbar1.

Through this interface, the human author is systematically presented with the AI's programmatic "understanding" of the recent narrative events. The author can meticulously review the newly generated database tags, verify the logic of the state transitions, and seamlessly edit, permanently delete, or manually augment these specific records using the floating toolbar. This mandatory human-in-the-loop validation protocol ensures that the AI's externalized "memory" of the story remains perfectly and continuously aligned with the human's specific authorial voice and overarching strategic intent1. It serves as a definitive safeguard against algorithmic drift, hallucinated state changes, and logic loops, ensuring absolute fidelity even throughout the most complex and lengthy interactive campaigns.

## **Advanced Architectural Mechanisms for Context Maintenance**

As the RPG narrative scales exponentially in both length and intricate complexity, relying purely on rigid database document retrieval becomes computationally insufficient. The interconnections between myriad characters, varied locations, and cascading historical events form a deeply complex web that requires advanced structural paradigms to maintain long-term semantic coherence and narrative resonance.

### **Vector Embeddings and Hybrid Semantic Retrieval**

While Firebase excels at managing explicit, highly structured state data (e.g., tracking Character A's precise health points or Location B's current weather modifiers), narrative prose frequently demands profound semantic understanding and thematic recall. A character might subtly reference an ancient prophecy spoken organically in Chapter 1 during a complex political negotiation occurring in Chapter 50\. Explicit keyword searches or rigid database queries within Firebase are highly likely to miss this connection if the exact phrasing differs even slightly.

To bridge this critical semantic gap, the CRONICLE architecture must be substantially augmented by integrating a dedicated vector database operating in parallel alongside the primary Firebase infrastructure. As the Story Weaver module sequentially logs completed plot points and scene summaries into the Firebase episodic timeline1, the engine architecture simultaneously executes a process to generate high-dimensional, dense vector embeddings of those specific scene summaries.

When generating new prose, the system performs a rapid cosine similarity search against the vector database, utilizing the current contextual state as the query vector. This advanced hybrid methodology pulls semantically relevant historical events—specifically those that share deep thematic resonance, emotional weight, or obscure narrative antecedents with the active moment—and seamlessly injects them into the Asset Hub alongside the explicit, rigid Firebase data parameters. This dual-pipeline approach ensures both absolute state accuracy via the Firebase NoSQL document structures and nuanced thematic recall via the Vector Retrieval augmented generation.

### **Mitigating "AI Slop" through Rigid Parameter Tethering**

The provided architectural documentation heavily emphasizes the absolute necessity of systematically avoiding "AI Slop"1. In the specialized context of long-horizon generative narratives, this slop manifests as generic, statistically average responses that actively ignore the unique, painstakingly developed specificities of the simulated world. This structural failure occurs when the underlying model's neural parameters default to broad, pervasive tropes because the specific contextual weight provided by the prompt is computationally too weak to overcome the model's generalized pre-training data.

The dynamic CRONICLE architecture actively and mathematically combats this degradation by enforcing a high-entropy context injection protocol. By programmatically feeding the generative model highly specific, granular tags extracted directly from the evolutionary lore files (e.g., .persona, .world) immediately prior to every single generation cycle, the system artificially and intentionally elevates the probability weight of highly specific, lore-accurate tokens1.

If the system prompt explicitly and rigidly commands the model to adhere exclusively to the Guidance Gems derived dynamically from the CRONICLE database, the output vector is forcefully pushed out of the generic, high-probability latent space and into the highly specialized, bespoke reality of the user's specific campaign. Every single new action, dialogue choice, and environmental description is meticulously and mathematically tethered to the larger, developing world history, creating a profound, unbreakable sense of consequence and narrative continuity that standard chat interfaces simply cannot achieve1.

## **Architectural Challenges, Latency Mitigation, and System Optimizations**

Designing and deploying this unprecedented level of database integration is not without significant computational, financial, and architectural hurdles. The pair-author ecosystem must delicately balance the immense depth of the CRONICLE data structures with the strict latency requirements necessary to maintain a fluid, immersive chat interface experience for the human user.

### **Latency in the Extraction and Synchronization Loop**

The comprehensive process of autoregressively generating prose, presenting it to the human user, executing a secondary NLP extraction pipeline, formulating JSON payloads, and successfully executing write operations to Firebase inherently introduces multiple compounding points of system latency. If the system architecture aggressively forces the user to wait for the entire CRONICLE database to fully update and synchronize before permitting the initiation of the next prompt, the interactive flow will be severely and unacceptably disrupted, ruining the pair-authoring experience.

The primary optimization strategy to resolve this bottleneck is the implementation of strictly Asynchronous Processing architecture. The resource-intensive extraction pipeline must operate entirely asynchronously from the primary user interface thread. When a block of generated prose is accepted by the user, the UI must immediately unlock, allowing the user to continue typing the subsequent prompt without delay.

Simultaneously, the system places the accepted text payload into a highly secure background processing queue. A dedicated background worker instance processes the text, utilizes the extraction models to identify the delta events, and executes the updates to the Firebase infrastructure. In the event that the user rapidly initiates a new generation cycle before the previous background database update is completely finalized, the system architecture must utilize an optimistic state model. It injects the most recently known, synchronized data from Firebase while appending a system-level flag alerting the LLM that background processing is currently underway, mitigating potential immediate contradictions while maintaining fluid user interaction speeds.

### **Token Economy and Context Window Mathematical Budgeting**

Even when leveraging advanced semantic vector retrieval and highly granular database structures, attempting to pull excessive quantities of data from the CRONICLE into the active Asset Hub will inevitably bloat the context window. This bloat directly increases API inference costs exponentially and heavily degrades generation quality, as LLMs fundamentally exhibit "lost in the middle" phenomena wherein they completely ignore crucial information positioned in the center of a massive prompt payload.

To strictly manage this economy, the engine architecture must employ a rigid, mathematically defined token budget for the Context Injection phase, explicitly categorizing data by immediate relevance1.

The system algorithmically evaluates retrieved data and assigns it to specific tiers. Tier 1 data is designated as mandatory and encompasses immediate scene variables, such as the exact current location, the identities of presently active characters, and the explicitly active quest objective. This data is injected almost verbatim from the Firebase structures to guarantee immediate accuracy. Tier 2 data is classified as highly relevant, encompassing the direct relationship matrices between the present characters and recent historical events explicitly involving these specific entities within a tight timeframe. Tier 3 data represents contextual flavor, covering broader macroeconomic world states or distant chronological history. If the algorithmic token budget for the current cycle is computationally constrained, Tier 3 data is automatically passed through a rapid summarization model to condense it into a single, token-efficient sentence prior to injection, or it is dropped entirely if the engine determines it is statistically irrelevant to the immediate scene resolution.

### **Mathematical Representation of Narrative State Transitions**

To effectively and predictably manage the dynamic CRONICLE architecture, the system fundamentally models the entire narrative construct as a vast Directed Acyclic Graph (DAG) intricately combined with a complex finite state machine. Every unique entity within the database (representing a specific node) possesses a deeply structured state vector mathematically represented as ![][image1]. A narrative event organically generated by the AI model acts structurally as a precise transformation function ![][image2] that fundamentally alters the existing state vector.

The continuous progression of the narrative state can be algebraically defined as:![][image3]

In this equation, ![][image4] strictly represents the established state of the entity at the current chronological time step, ![][image5] represents the specific narrative event or action mathematically extracted from the generated prose via the NLP pipeline, and ![][image6] represents the newly updated, consequential state that is definitively written to the Firebase infrastructure. This strict mathematical rigor ensures that the engine architecture processes narrative changes not as vague, subjective textual additions, but as highly precise, computable state transitions. This approach algorithmically enforces the absolute, unyielding consistency fundamentally required to operate a granular interactive story platform effectively over indefinite horizons.

## **Conclusions on the Pair-Author Infrastructure**

The complex integration of a dedicated, highly dynamic CRONICLE system into a pair-author RPG engine architecture fundamentally redefines the foundational paradigms of interactive fiction chatbots. By decisively transitioning from transient, highly volatile context reliance to an externalized, Firebase-backed "Single Source of Truth," the system entirely mitigates the long-horizon memory degradation and contextual drift inherently present in autoregressive language models1.

The robust architectural design outlined throughout this report expertly leverages the ecosystem's specialized Element Forge Modules to establish deep, granular categorization of complex narrative data arrays1. By architecturally maintaining distinct, continuously evolving .persona and .world records rather than relying on the outdated methodology of static lore files, the engine guarantees that the generated narrative organically exists within a consequential, deeply reactive environment1. The implementation of automated, NLP-driven algorithmic extraction creates a highly efficient, seamless feedback loop wherein the generated prose continuously and silently updates the underlying NoSQL database. Concurrently, the critical inclusion of intuitive UI mechanisms, specifically the floating toolbar, guarantees that the human author retains ultimate, unassailable oversight over the AI's logical deductions and state transitions1.

Ultimately, this advanced computational paradigm transforms the underlying Artificial Intelligence from a mere probabilistic text generator into a highly robust, state-aware computational co-author. It structurally guarantees that as the interactive story platform scales exponentially into lengthy, highly complex campaigns encompassing hundreds of thousands of words, the narrative core remains permanently tethered to an internally consistent, dynamically evolving world history. This rigorous approach effectively eliminates the systemic risk of "AI Slop" and dramatically elevates the technological standard of machine-assisted storytelling1. By treating context not as a static block of historical text, but as a fluid, modular, and highly precise computational database query mathematically injected prior to generation, the architecture achieves a level of persistence, narrative depth, and relational accuracy previously entirely unattainable in standalone conversational agents.

#### **Works cited**

> 1. [https://drive.google.com/open?id=1OaERSPHG1KlYExQ7TDgmlcFb1MxEBcaYPnxp0efxc68](https://drive.google.com/open?id=1OaERSPHG1KlYExQ7TDgmlcFb1MxEBcaYPnxp0efxc68)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAaCAYAAAC3g3x9AAABTUlEQVR4Xu3UzStEYRTH8SMvmc0obJSFlJGtkhIppSgrlPwBomRjQVE2srCTtQ07ygqr+SOkyDRLKQsrxUIK3+OZ6z73dLv3zmRhMb/6bJ7zzLnPy50rUk9KGtBiB7NkDQ94xBNuMIwNLHnzMqUN52j3xkbwjFcMeeOp0S0doMMWyB7u0GkLSZnGl7jGNiuYtYNpGcUHTsRtszVarj45XIhbZeAWExK/6kzRptrEb/qOMX9SLWnGIK7FNT2MlpOj21lEly2QKXziyBaSoq/ClcQ3DC5q2RaSoi9rCb1mXFe+i3t0m5pG39fYy9Kn6znpj/XsNDpxAW+Yq4wFKeASq9gyNWnCqbhmZyiLm1gUt+rxcOpPdKV6UZPow3a07Br2i1uR6sE8BtAYTvvNOl6wjx3ko+Xqc1zxZ9mUsKH+CWakxm+kHz2auC9SPf8x3w/aNHOzY9MzAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAaCAYAAAAjZdWPAAACaElEQVR4Xu2XT6hNURTGP6GIer3Inygxe0WUPyXMSCYGYkJGBkyMDQ1kYCZFkhIlJTEiIr3RGzxK5M1IJEZSipL8+b67zumuu845+5xzXUbnV1/du9bZe6+7zlp77wt0dPxTVlLronEIFlIXqZ3R0YZl1D3qMfWG2jTo7rGcehCNGXupSw21IRszRt2mtmTfW3ODuktdoH5TJwbdmAtb8FSw5yj7B6gp2Pjz1H6nI9SzzLcnGyN2UE+pVc7WmE/Uaeo49RBWBp5d1CtqdbB7FlMz1FdqY/AJzfkCg745sISddbbGfKHWR2PGGuojtS86AkdhmbzsbIdhpSNUXreo8b67Rz5/I9QMJ2Gv/Tt1PfusrHq06GdU/yihjCkgBX3I2ZXFfNxsWMCz+u4eC6hHwVaJJlkCm1QlobpSNub5h2D1/TbzVZGXxi/qDvpN9wTFzJZxFZbExmyG1XMVmnAS6Um3Uz+ol9RB9JvvnH8ogdZfGo0pVKupem0StN6GSiMGmdezmKBWuO8ejU+9yQL6lcp2FXVBq5y0XSpoH6TIt7L5sJ5Z63yeVkHnC6ZeTV3Q2srew3YA7QRl6E3qDFDDltGqPPTgaxSbz1PXiDqK1YDaAbQTRJRtHSBbo8PRqhFVFt+iMaAsVe3j2r7OwEqjrJl3ww6l+7ASKUPBTkZjCu2pWjCFGkgnpm/WRdRz2Ng66S2kGl0l9SEaU6jb606j/Ki9guLBMArUvO+iMaILizb9bbA6VEB1NLl7DIMuYjdRfRHrkdfPT+oYLBDdtOqou+UNi9aeRvGCNlJG+SfgGv7yT0BHR8d/4g8Uh3wOEAgd3wAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAK0AAAAaCAYAAADFYNyOAAAGuElEQVR4Xu2aeehtUxTHl/DM0yOz/J4eMiVkzFCGopA8hSR/SMYnkVn6mcoj85jkoV56xlf4B3ENSZShiEghUYSIP5Bhfd462913nX3uOeeeO/10PrX6/e4+955hr+9ea+11r0hLS0tLS0tLSyNWUZvnB1tqwzyeo3at2mru2CRZVW11PzhEdlNbpra5PzAMFqt9pfa12rdqH6jtq3aJ2hnR+1ry4PQr1d5Ru0hMoJ6z1e6XvEDWUrtM7YEKdqPahvax2qyvtkTMx9+pvaK2g9o9aodH7xsF6OgpP9iUDcROOj8aO0Dte7Vf1faOxlvynCQ2Vyz8jtq6PUdF9hELAgvdOCDiw9TOUvtZ7Tex85wQ2VXZsc/VNrOP1WJbsevfmr1mUZ2o9ofal2pbZ+OjgutdJ/kFOzCc8Ha1jf0B5Qa1j9Q28Qda/mNNtefFouyhakf1Hl4ZSZ9Vm3XjHqLd35IWPRwvxcf6Ea7/uPSKhhLlSbF75xlGzQK1I/zgoDDJ/0g6pbH6mayWYg5U+1PtQn8gg4X/utp6/kBEED5+iEXPeIiCx4idqy7cF+c9zx8QOx9ZYFxQdm7nBwchTPqjYiXBOFbd/wFKAurMF8REwV9ex5tWomJH7cFoLAWOxKHeqbuqrZP9j1/qRlk4Rez+KAXulCGm6AH4SfKZaCBC+uDBgn0olupS0XeuQElznPTWhmXGTrcqbIi2UHtCzBkHZa9jeE3NeKkb94TSgLp4qZj4HxGrY5uyqZg/Y/++prZz/KYxUWUuKoNw/YP9LuaIKiDu/dTW8AeGxJZqe/rBEkYtWiDlk/qpZzdyx2AvsY0Vqb0fpGnm/GHp3sus2i/dtzSCzsE1al9I17/fSHpjmIKN+h5+MGJ7P1AA81SWdWpD6kAc74k9GOmkDAR7gQy39iWKMdEBrkF9PW1Qb9IiXCbprFRFtKGEINLGrScWBCUbsGmibURwacqRYm0v/HumO5YCwd4n1oEognZfv+OBjlgGGRgm+WTJpzTgwZjEKquCFUivzzfMT3WvY1J1M5/HafQyEQIOjyHNYdNE2A9c4Q9kVBHtTmo/iEXBraJxnvXq7H9qWxZGHdHy3tMkXQezKUO0RZvHGN5DeyyGc1LC0OeFXcS0UnZ/HWkoWtInO9aUaIMzylYiwr9NTOQxRImigpsHTkVNzkXbjdbI+5IXLZTdT8w4ygPuB+cXPWsV0ZKhOAftJ7/wgbF7pX4mYzFQb6dEy+bMR/YU9IS5L98bpm//bjSO7xBx2fkalwdc+BPJtyC4ARrBH0u66YywQirkptk1xxECmDB/3kCRaAMsoiLR4oRUlE4xDtHiAKIkz5uiykaMEqxf1FskFqFI0zGcm8USl1ExiDxVa1MC0rPFb17QIXCEcc7/UDYew2L1i4yFUFZOls1FKSFKxN9UcHOkAqIDkxVDKnhO7VzppkOET+chPCSCulhskll5B2fjMU1E+7LkV/2kKNuEQXhPUXRBIEQsshrZzYNQaVWRzmNog70k5r+lkhcVICCi6enSe/xytR+ltz8b/I4vEd/N2Th+jkU2I3ZeamJEf4t0MzVaeFq6LboUbCyLslIprJDlYoJl1X0qJsYXxaLvId23roSIy+aMbzTYKVJ4A2kvVaP0W3FNRPumFEfwcRN6q0WiCTAXqS8X/pLebk2Rfaa2TfaZANdDMIgS8fqIySLqiG2Q3xDz3U1q56u9Jd1aNHCs2OILewaEC/jWlzZksLclv8jwF/opWsDAXmWBH6wKot1R7OGxGbH0SJrjVz8eUhc9wyVim4OQklKixTmvRq+5DhG6kxkO5Dv08BqLy4t+ol0h6fFJQP2GaIKDi9hfrL00ivtGIOwpvGjZEC3M/sef+BX/Ui75BRaiNhH/erG0H7JsSrS+ng3gt072NwXXfUzSdftI4Oa9OCElWiYI0VFyzHPHYC5HWjIO0WSx2EKuEjkQEGl31o0PAxYEEdQLsQ6h7vbihJRo43p2bekGubJIyyKq2vcfCtQ1QZw44WgxQfqaFqhZqHdC5PY0Ee2ka1rmgZR9l9ozYuVVFcH0+5XXoBAUaA/2a/pXAX90pFecM9lfX9MC9TkLFh1Qa/MX+tW0zBFzNbYoG+DCbBz8WKrl5dNVTJlo+8H3/XMV5moafwQeYBFQr8blYarlxXPMl97fMDB2t1jk9+wu1vUZyY/AB4WIyIqv44iqbasYFoxfNC2jh25QWbAgg9whk/0xTi1YZcP+GtfDNQaNzi3NGObXuFMFohrlD2aIsKSZlslQ9oOZss1oS0tLS8vU8y+oo1RhLzq/wgAAAABJRU5ErkJggg==>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAaCAYAAAAwspV7AAACB0lEQVR4Xu2VPShFYRjHH/n+KIV8hNwoZSGDRYrByoKQxcYgg5KyKRYSWRSySBYmmwwGgyg2ShkYGMwW5eP/7z23857n3Hsu1+3cwf3Vr3vPc8895znPed7nFcnwj8iDWToYFtXwFT7BF7gE2+A2LLbOC40WeAuzneNCuAU/xSQXOiXwBK6reCN8hv0qHgpz8AuOq3glXBZTtdAZE5PUG2wS9xWmlTp4JyYx+g7XJE3NbVMDF8VNjO7AHPukAEphuw5a9MgfHpIXn4Yf8FFMsongfzZhg/7BIgLnYa6K+2AVhsSsPh0/lJ8nNQOHVYzX5EhptmITjoGwl/bEnxSn9z68EFOFRPABqlSsA16reC08to5j0gtvYIWK18N7OKnihAmXi/dBdp24DSvCZO2e5PcD6zgmfMec2KPiXpQziQ1+Kt4q8Xe+Ij4pR8gK7HZ+45yLEoEbYrYqDuRV8bYA7xmXAngkph/OxVRsAT6ISUqvFE71KzEDlTAxVpr0OZ9RWPlL2KXixH4AH/mwVUwFOCy59w2KvzcIE2Tl2CMcG3wtA+IOWZ1UrH6Kos9NGpafKzHeBXXc7qci8e4QgZX6DWzqM/HePAI7ne/6Rnz9bAv255TzGSWwp5KBg4/9ovdGPRLYEmXiH5QcCQlXX6qYhSM6GAMuDhoKKd1mUkmiDZkrUo+ZDEnxDUY0TiGPNAtXAAAAAElFTkSuQmCC>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAbCAYAAAB1NA+iAAAA+ElEQVR4Xu2SPwtBYRSHTzFQpKQkFjazUmQ02JQMRuUbWJRvYLAaZLFbyWAzUiajTfkEJoXf6Zw3977u7RoN96mn+/49nXPeSxRik4NTOA9wBst6x0UatuEEvuABdh0O4AneYUXveDImCTC0N0CJJDB/PYnBNXzAhrXHcJk7mLU3DAV4hRf6HGqSpM9wgCVM6PwLPvyEKxhVuWm8zkRgUseemPqPJB3fk2STdx7yw1n/iKTzHMBkE4ip/wwzutYhCWbg9/fNxq6f6cOqjuNwAYs6dxH0fCm4gTV7w8A/xo3cz8dw1+skf+CWJAsXLZKu/2JP74SE/Blvo5M4gbYHl/UAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADcAAAAaCAYAAAAT6cSuAAACiUlEQVR4Xu2WO2gUURSGj/iKmCBRUUQhD3wgVkZEIz5ADJhCCCqIEUtRFEEEYyGkEQsrHyio2FhYaJEmCUJsNlXARgOKkkYQIUUqIRYiGP9/zx327NmZcdedFUb2g48k52x27n/n3jsj0qRJ7lkEl/li3lgBv8CvcBZOwz1wCJ4zn8sdq+AruNrU9sE5OA93m3qu4LK7C9/4BrgFP8C1vpEX+uECfOAb4AI87ot5Yj/8KRqQS7GlvJ1veJCMioaLfA8Piy7Z3MOAF6U84A94wH4oBU7CXrjcNzJiK9zii7WyFPbAt6IB75e3Y2GwK5Lt3lwnOuERHNcN2GFqqXBQp+EG3wBH4S/41Ddi2AkfwiWufhmedTWS9lLAQC/gjFSOa4foeGzoRHi8j0vll5DokDnvGw4O9I7oZFja4KToSezh9QZ9MbAY9sJ3UjkuXusJPOLqsfDB/Al2uzq/5Cb8CDe5HmmFa8Lv6+EE3FhqF9kuOkD/3SQtHNkl8eHIGaluqxTvCvcVg3BNEwY7Bb/DE6EWwU09Jrq/LoUaJ4gnLQMTPkauwQL8LDrTB0Mvop5wvN4IXOkbFu4Prm0Geym6xrlvXovezUOljxbhHeQh0xf+jk6uY/BZ+N3C2eXbTRz1hGOPY2z3DQvDbRO9U7QTDoguJ657z1X4Dd6Gz+FwqMeFi9tvBeOU6GTa2mPR/yNp4VgrhJ+ZwQA+BIkLZ/cbl7s/GRt+52rlupSH4HHMQfs9R3jHeMhwX5wUDWupJ1xVe+5v4PLlKWnfPZMeBQxrA1v+FC4JXosv972+0Ug404+k8iGeBAfpl2o1bIb3pHSy/xM42Kxfvzw1v35lCQM28sWZobp8scn/xG+9RWltWohoJQAAAABJRU5ErkJggg==>