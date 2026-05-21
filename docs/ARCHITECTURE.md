# Bob Insights - Architecture Specification

## 1. High-Level Component Diagram

```mermaid
graph TB
    subgraph "External"
        User[User/Bob AI]
        FileSystem[File System<br/>Bob Storage]
        LLM[LLM Provider<br/>Claude/GPT]
    end

    subgraph "MCP Server Layer"
        Server[MCP Server<br/>server/index.ts]
        ListTool[list_conversations<br/>Tool Handler]
        GetTool[get_conversation<br/>Tool Handler]
        AnalyzeTool[analyze_problems<br/>Tool Handler]
        ErrorHandler[Error Handler]
    end

    subgraph "Business Logic Layer"
        subgraph "Storage Module"
            PathResolver[Path Resolver<br/>Platform Detection]
            TaskRetriever[Task Retriever<br/>File Operations]
        end

        subgraph "Extraction Module"
            ContentExtractor[Content Extractor<br/>Text Extraction]
            ToolDetector[Tool Detector<br/>MCP vs Internal]
            Formatter[Formatter<br/>Display Format]
        end

        subgraph "Analysis Module"
            ProblemDetector[Problem Detector<br/>Pattern Matching]
            Indicators[Indicators<br/>Score Calculation]
            SummaryBuilder[Summary Builder<br/>Data Aggregation]
        end

        subgraph "LLM Module"
            PromptBuilder[Prompt Builder<br/>Template Generation]
            ResponseParser[Response Parser<br/>JSON Parsing]
        end
    end

    subgraph "Foundation Layer"
        Types[Type Definitions<br/>types/]
        Config[Configuration<br/>Constants]
    end

    User -->|MCP Request| Server
    Server --> ListTool
    Server --> GetTool
    Server --> AnalyzeTool
    Server --> ErrorHandler

    ListTool --> TaskRetriever
    GetTool --> TaskRetriever
    AnalyzeTool --> TaskRetriever

    TaskRetriever --> PathResolver
    PathResolver -->|Read| FileSystem
    TaskRetriever -->|Read Files| FileSystem

    ListTool --> ContentExtractor
    GetTool --> ContentExtractor
    AnalyzeTool --> ContentExtractor

    ContentExtractor --> ToolDetector
    ContentExtractor --> Formatter

    ListTool --> ProblemDetector
    GetTool --> ProblemDetector
    AnalyzeTool --> ProblemDetector

    ProblemDetector --> Indicators
    Indicators --> SummaryBuilder

    AnalyzeTool --> PromptBuilder
    PromptBuilder -->|Prompt| LLM
    LLM -->|Response| ResponseParser

    PathResolver -.->|Uses| Types
    ContentExtractor -.->|Uses| Types
    ProblemDetector -.->|Uses| Types
    PromptBuilder -.->|Uses| Types

    Server -->|Response| User

    classDef external fill:#e8f4f8,stroke:#4a90a4,stroke-width:2px
    classDef server fill:#fff4e6,stroke:#d4a574,stroke-width:2px
    classDef storage fill:#e8f8e8,stroke:#6ba86b,stroke-width:2px
    classDef extraction fill:#f0e8f8,stroke:#9b7ba8,stroke-width:2px
    classDef analysis fill:#ffe8e8,stroke:#c47676,stroke-width:2px
    classDef llm fill:#e8f0f8,stroke:#6b8ba8,stroke-width:2px
    classDef foundation fill:#f8f8f8,stroke:#999,stroke-width:2px

    class User,FileSystem,LLM external
    class Server,ListTool,GetTool,AnalyzeTool,ErrorHandler server
    class PathResolver,TaskRetriever storage
    class ContentExtractor,ToolDetector,Formatter extraction
    class ProblemDetector,Indicators,SummaryBuilder analysis
    class PromptBuilder,ResponseParser llm
    class Types,Config foundation
```

## 2. Component Responsibilities

### External Layer
- **User/Bob AI**: Initiates requests through MCP protocol
- **File System**: Stores Bob conversation history
- **LLM Provider**: Analyzes conversations (optional, for deep analysis)

### MCP Server Layer
- **MCP Server**: Entry point, handles MCP protocol
- **Tool Handlers**: Implement business logic for each tool
- **Error Handler**: Centralized error handling and formatting

### Business Logic Layer

#### Storage Module
- **Path Resolver**: Detects platform and resolves storage paths
- **Task Retriever**: Reads conversation files from disk

#### Extraction Module
- **Content Extractor**: Extracts text from message structures
- **Tool Detector**: Identifies MCP vs internal tool usage
- **Formatter**: Formats conversations for display

#### Analysis Module
- **Problem Detector**: Applies regex patterns to detect issues
- **Indicators**: Calculates problem indicators and scores
- **Summary Builder**: Aggregates data into conversation summaries

#### LLM Module
- **Prompt Builder**: Generates analysis prompts for LLM
- **Response Parser**: Parses and validates LLM responses

### Foundation Layer
- **Type Definitions**: Shared TypeScript interfaces
- **Configuration**: Constants and configuration values

## 3. BPMN: List Conversations Flow

```mermaid
flowchart TD
    Start([User Request:<br/>list_conversations]) --> ValidateParams[Validate Parameters<br/>limit, days, minScore]
    ValidateParams --> GetTasks[Get All Tasks<br/>storage.getAllTasks]
    
    GetTasks --> HasTasks{Tasks<br/>Found?}
    HasTasks -->|No| ReturnEmpty[Return Empty Result]
    HasTasks -->|Yes| FilterByDate{Filter by<br/>Days?}
    
    FilterByDate -->|Yes| ApplyDateFilter[Apply Date Filter<br/>cutoff = now - days]
    FilterByDate -->|No| SortTasks[Sort by Recency]
    ApplyDateFilter --> SortTasks
    
    SortTasks --> LimitTasks[Limit to N Tasks<br/>default: 10]
    LimitTasks --> ProcessLoop{For Each<br/>Task}
    
    ProcessLoop -->|Next| ReadFile[Read Conversation File<br/>fs.readFileSync]
    ReadFile --> ParseJSON[Parse JSON<br/>Message array]
    ParseJSON --> ExtractText[Extract Text Content<br/>extraction.extractTextContent]
    
    ExtractText --> CountTools[Count Tool Uses<br/>extraction.countToolUses]
    CountTools --> DetectProblems[Detect Problems<br/>analysis.detectProblems]
    DetectProblems --> CalcScore[Calculate Score<br/>analysis.calculateScore]
    
    CalcScore --> CheckScore{Score >=<br/>minScore?}
    CheckScore -->|Yes| AddSummary[Add to Summaries]
    CheckScore -->|No| SkipTask[Skip Task]
    
    AddSummary --> MoreTasks{More<br/>Tasks?}
    SkipTask --> MoreTasks
    MoreTasks -->|Yes| ProcessLoop
    MoreTasks -->|No| SortByScore[Sort by Problem Score<br/>Descending]
    
    SortByScore --> FormatResponse[Format Response<br/>JSON with metadata]
    FormatResponse --> ReturnResult[Return Result]
    
    ReturnEmpty --> End([Response to User])
    ReturnResult --> End
    
    style Start fill:#d4e6f1
    style End fill:#d5f4e6
    style GetTasks fill:#fef5e7
    style ExtractText fill:#f4ecf7
    style DetectProblems fill:#fadbd8
    style FormatResponse fill:#e8f8f5
```

## 4. BPMN: Get Conversation Flow

```mermaid
flowchart TD
    Start([User Request:<br/>get_conversation]) --> ValidateTaskId[Validate taskId<br/>Parameter]
    ValidateTaskId --> GetAllTasks[Get All Tasks<br/>storage.getAllTasks]
    
    GetAllTasks --> FindTask[Find Task by ID<br/>Array.find]
    FindTask --> TaskExists{Task<br/>Found?}
    
    TaskExists -->|No| ReturnError[Return Error:<br/>Task Not Found]
    TaskExists -->|Yes| ReadFile[Read Conversation File<br/>fs.readFileSync]
    
    ReadFile --> ParseJSON[Parse JSON<br/>Message array]
    ParseJSON --> ExtractContent[Extract Content<br/>extraction module]
    
    ExtractContent --> ExtractInitial[Extract Initial Request<br/>First user message]
    ExtractInitial --> CountMessages[Count Messages<br/>conversation.length]
    CountMessages --> CountTools[Count Tool Uses<br/>extraction.countToolUses]
    
    CountTools --> AnalyzeProblems[Analyze Problems<br/>analysis.analyzeProblems]
    AnalyzeProblems --> CalcIndicators[Calculate Indicators<br/>analysis.calculateIndicators]
    CalcIndicators --> CalcScore[Calculate Score<br/>analysis.calculateScore]
    
    CalcScore --> FormatConv[Format Conversation<br/>extraction.formatConversation]
    FormatConv --> BuildSummary[Build Summary Object<br/>analysis.buildSummary]
    
    BuildSummary --> FormatResponse[Format Response<br/>JSON with full details]
    FormatResponse --> ReturnResult[Return Result]
    
    ReturnError --> End([Response to User])
    ReturnResult --> End
    
    style Start fill:#d4e6f1
    style End fill:#d5f4e6
    style ReadFile fill:#fef5e7
    style ExtractContent fill:#f4ecf7
    style AnalyzeProblems fill:#fadbd8
    style FormatResponse fill:#e8f8f5
```

## 5. BPMN: Analyze Problems Flow

```mermaid
flowchart TD
    Start([User Request:<br/>analyze_problems]) --> ValidateParams[Validate Parameters<br/>limit, days, minScore, question]
    ValidateParams --> GetTasks[Get All Tasks<br/>storage.getAllTasks]
    
    GetTasks --> HasTasks{Tasks<br/>Found?}
    HasTasks -->|No| ReturnEmpty[Return Empty Result]
    HasTasks -->|Yes| FilterByDate{Filter by<br/>Days?}
    
    FilterByDate -->|Yes| ApplyDateFilter[Apply Date Filter]
    FilterByDate -->|No| SortTasks[Sort by Recency]
    ApplyDateFilter --> SortTasks
    
    SortTasks --> LimitTasks[Limit to N Tasks<br/>default: 20]
    LimitTasks --> ProcessLoop{For Each<br/>Task}
    
    ProcessLoop -->|Next| AnalyzeTask[Analyze Task<br/>Same as List Flow]
    AnalyzeTask --> AddToAll[Add to All Summaries]
    AddToAll --> MoreTasks{More<br/>Tasks?}
    
    MoreTasks -->|Yes| ProcessLoop
    MoreTasks -->|No| FilterProblematic[Filter Problematic<br/>score >= minScore]
    
    FilterProblematic --> HasProblematic{Found<br/>Problematic?}
    HasProblematic -->|No| ReturnNoProblems[Return: No Problems Found<br/>Suggest lower threshold]
    HasProblematic -->|Yes| SortByScore[Sort by Score<br/>Descending]
    
    SortByScore --> BuildPrompt[Build LLM Prompt<br/>llm.buildPrompt]
    BuildPrompt --> AddQuestion[Add Custom Question<br/>or default]
    AddQuestion --> AddContext[Add Context<br/>Problem indicators]
    
    AddContext --> FormatConversations[Format Conversations<br/>For LLM analysis]
    FormatConversations --> AddInstructions[Add Analysis Instructions<br/>Root cause, intent, quality]
    
    AddInstructions --> FormatResponse[Format Response<br/>summary + prompt]
    FormatResponse --> ReturnResult[Return Result]
    
    ReturnEmpty --> End([Response to User])
    ReturnNoProblems --> End
    ReturnResult --> End
    
    style Start fill:#d4e6f1
    style End fill:#d5f4e6
    style GetTasks fill:#fef5e7
    style AnalyzeTask fill:#fadbd8
    style BuildPrompt fill:#e8daef
    style FormatResponse fill:#e8f8f5
```

## 6. Data Flow Between Modules

```mermaid
sequenceDiagram
    participant User
    participant Server
    participant Storage
    participant Extraction
    participant Analysis
    participant LLM

    User->>Server: analyze_problems(params)
    activate Server
    
    Server->>Storage: getAllTasks()
    activate Storage
    Storage->>Storage: getStoragePaths()
    Storage->>Storage: readTaskDirectories()
    Storage-->>Server: TaskInfo[]
    deactivate Storage
    
    Server->>Server: filterByDate(tasks)
    Server->>Server: sortByRecency(tasks)
    Server->>Server: limitResults(tasks)
    
    loop For each task
        Server->>Storage: readConversationFile(taskId)
        activate Storage
        Storage-->>Server: Message[]
        deactivate Storage
        
        Server->>Extraction: extractTextContent(messages)
        activate Extraction
        Extraction-->>Server: string
        deactivate Extraction
        
        Server->>Extraction: countToolUses(messages)
        activate Extraction
        Extraction-->>Server: number
        deactivate Extraction
        
        Server->>Analysis: analyzeProblems(messages)
        activate Analysis
        Analysis->>Analysis: detectPatterns(text)
        Analysis->>Analysis: calculateIndicators()
        Analysis->>Analysis: calculateScore()
        Analysis-->>Server: ProblemIndicators + score
        deactivate Analysis
        
        Server->>Analysis: buildSummary(data)
        activate Analysis
        Analysis-->>Server: ConversationSummary
        deactivate Analysis
    end
    
    Server->>Server: filterByScore(summaries)
    
    Server->>LLM: buildAnalysisPrompt(summaries)
    activate LLM
    LLM->>LLM: formatConversations()
    LLM->>LLM: addInstructions()
    LLM-->>Server: AnalysisPrompt
    deactivate LLM
    
    Server-->>User: Response with prompt
    deactivate Server
```

## 7. Module Dependencies

```mermaid
graph LR
    subgraph "Layer 1: Foundation"
        Types[types/]
    end
    
    subgraph "Layer 2: Core Modules"
        Storage[storage/]
        Extraction[extraction/]
        Analysis[analysis/]
        LLM[llm/]
    end
    
    subgraph "Layer 3: Server"
        Server[server/]
    end
    
    Storage --> Types
    Extraction --> Types
    Analysis --> Types
    LLM --> Types
    
    Server --> Storage
    Server --> Extraction
    Server --> Analysis
    Server --> LLM
    
    Analysis --> Extraction
    LLM --> Extraction
    LLM --> Analysis
    
    style Types fill:#f0f0f0
    style Storage fill:#e8f8e8
    style Extraction fill:#f0e8f8
    style Analysis fill:#ffe8e8
    style LLM fill:#e8f0f8
    style Server fill:#fff4e6
```

## 8. File Structure

```
bob-insights/
├── src/
│   ├── types/
│   │   ├── index.ts              # Re-exports
│   │   ├── conversation.ts       # Message, ContentBlock, ConversationSummary
│   │   ├── analysis.ts           # ProblemIndicators, AnalysisResult
│   │   └── storage.ts            # TaskInfo, StorageConfig
│   │
│   ├── storage/
│   │   ├── index.ts              # Re-exports
│   │   ├── path-resolver.ts      # getStoragePaths(), detectPlatform()
│   │   └── task-retriever.ts     # getAllTasks(), readConversation()
│   │
│   ├── extraction/
│   │   ├── index.ts              # Re-exports
│   │   ├── content-extractor.ts  # extractTextContent(), extractInitialRequest()
│   │   ├── tool-detector.ts      # isMcpTool(), countToolUses()
│   │   └── formatter.ts          # formatConversation()
│   │
│   ├── analysis/
│   │   ├── index.ts              # Re-exports
│   │   ├── problem-detector.ts   # detectProblems(), PROBLEM_PATTERNS
│   │   ├── indicators.ts         # calculateIndicators(), calculateScore()
│   │   └── summary-builder.ts    # buildSummary(), createConversationSummary()
│   │
│   ├── llm/
│   │   ├── index.ts              # Re-exports
│   │   ├── prompt-builder.ts     # buildAnalysisPrompt(), formatPromptAsText()
│   │   └── response-parser.ts    # parseAnalysisResponse()
│   │
│   ├── server/
│   │   ├── index.ts              # Server setup and initialization
│   │   ├── tools/
│   │   │   ├── list-conversations.ts
│   │   │   ├── get-conversation.ts
│   │   │   └── analyze-problems.ts
│   │   └── handlers/
│   │       └── error-handler.ts
│   │
│   └── index.ts                   # Main entry point
│
├── docs/
│   └── ARCHITECTURE.md            # This file
│
├── tests/
│   ├── storage/
│   ├── extraction/
│   ├── analysis/
│   └── llm/
│
├── package.json
├── tsconfig.json
└── README.md
```

## 9. Key Design Principles

### Single Responsibility
Each module has one clear purpose and reason to change.

### Dependency Inversion
High-level modules (server) depend on abstractions (types), not concrete implementations.

### Open/Closed
Modules are open for extension but closed for modification.

### Interface Segregation
Modules expose only what's needed through clean interfaces.

### Don't Repeat Yourself
Common functionality is centralized and reused.

## 10. Testing Strategy

### Unit Tests
- Test each module independently
- Mock dependencies
- Focus on business logic

### Integration Tests
- Test module interactions
- Test file system operations
- Test end-to-end flows

### Test Coverage Goals
- Types: 100% (compile-time)
- Storage: 90%+
- Extraction: 90%+
- Analysis: 95%+
- LLM: 85%+
- Server: 80%+

## 11. Migration Path

1. **Phase 1**: Create types/ module
2. **Phase 2**: Extract storage/ module
3. **Phase 3**: Extract extraction/ module
4. **Phase 4**: Extract analysis/ module
5. **Phase 5**: Extract llm/ module
6. **Phase 6**: Refactor server/ module
7. **Phase 7**: Update main index.ts
8. **Phase 8**: Add tests for each module
9. **Phase 9**: Update documentation
10. **Phase 10**: Deprecate old structure