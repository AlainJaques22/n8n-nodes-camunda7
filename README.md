# n8n-nodes-camunda7

This is an n8n community node that allows you to interact with [Camunda 7 BPM Platform](https://camunda.com/platform-7/) in your n8n workflows.

Camunda 7 is a powerful open-source workflow and decision automation platform. This node enables you to start processes, complete tasks, send messages, and retrieve process variables directly from n8n.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### npm Installation

```bash
npm install n8n-nodes-camunda7
```

### n8n Desktop/Cloud

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-camunda7` and confirm

## Operations

This node supports the following operations:

### Process Definition

| Operation | Description |
|-----------|-------------|
| **Start Instance** | Start a new process instance by process definition key (supports returning variables in response) |

### Process Instance

| Operation | Description |
|-----------|-------------|
| **Get Variables** | Retrieve all variables from a process instance |

### Task

| Operation | Description |
|-----------|-------------|
| **Complete** | Complete a user task with optional variables |
| **Query** | Query tasks by process instance ID, assignee, or other filters |

### Message

| Operation | Description |
|-----------|-------------|
| **Send** | Correlate a message to waiting process instances |

## Credentials

To use this node, you need to configure Camunda 7 API credentials:

| Field | Description |
|-------|-------------|
| **Base URL** | The URL of your Camunda 7 REST API (default: `http://localhost:8080/engine-rest`) |
| **Username** | Username for Basic Authentication |
| **Password** | Password for Basic Authentication |

## Usage Examples

### Start a Process Instance

1. Add a **Camunda 7** node to your workflow
2. Select **Process Definition** as the resource
3. Select **Start Instance** as the operation
4. Enter the **Process Definition Key** (the `id` attribute from your BPMN file)
5. Optionally add a **Business Key** and **Variables**

**Example Variables:**
```
Name: customerName
Value: John Doe
Type: String

Name: orderAmount
Value: 150.50
Type: Double
```

### Complete a User Task

1. Add a **Camunda 7** node to your workflow
2. Select **Task** as the resource
3. Select **Complete** as the operation
4. Enter the **Task ID** (obtained from task queries or previous workflow steps)
5. Optionally add variables to pass back to the process

### Send a Message

1. Add a **Camunda 7** node to your workflow
2. Select **Message** as the resource
3. Select **Send** as the operation
4. Enter the **Message Name** (as defined in your BPMN message event)
5. Optionally specify a **Business Key** or **Process Instance ID** for correlation
6. Add any **Process Variables** to include with the message

### Get Process Variables

1. Add a **Camunda 7** node to your workflow
2. Select **Process Instance** as the resource
3. Select **Get Variables** as the operation
4. Enter the **Process Instance ID**
5. The node returns all process variables as a JSON object

### Query Tasks

Find tasks programmatically without manually checking Camunda Cockpit.

1. Add a **Camunda 7** node to your workflow
2. Select **Task** as the resource
3. Select **Query** as the operation
4. Optionally filter by:
   - **Process Instance ID**: Find tasks for a specific process
   - **Assignee**: Filter by assigned user
   - **Task Definition Key**: Filter by BPMN task key
   - **Task Name**: Filter by task name

**Example Output:**
```json
[
  {
    "id": "task-456",
    "name": "Review Order",
    "processInstanceId": "abc-123",
    "assignee": "demo",
    "taskDefinitionKey": "UserTask_1",
    "created": "2025-01-22T10:30:00.000Z"
  }
]
```

**Use Case:** Get task IDs to use with the "Complete" operation.

### Start Process with Variables in Return

Get all process variables immediately when starting a process, eliminating the need for a separate "Get Variables" call.

1. Add a **Camunda 7** node to your workflow
2. Select **Process Definition** as the resource
3. Select **Start Instance** as the operation
4. Enter your **Process Definition Key** and **Variables**
5. Click **Add Option** and enable **With Variables in Return**

**Example Output (with option enabled):**
```json
{
  "id": "process-abc-123",
  "definitionId": "OrderProcess:1:def-456",
  "businessKey": "order-789",
  "variables": {
    "orderId": {"value": "12345", "type": "String"},
    "amount": {"value": 99.99, "type": "Double"}
  }
}
```

**Benefit:** Reduces API calls from 2 to 1 when you need variables immediately after starting a process.

## Variable Types

The node supports automatic type detection or explicit type specification:

| Type | Description | Example Value |
|------|-------------|---------------|
| String | Text values | `"Hello World"` |
| Integer | Whole numbers | `42` |
| Long | Large whole numbers | `9999999999` |
| Double | Decimal numbers | `3.14159` |
| Boolean | True/False | `true` |
| Date | ISO date strings | `2024-01-15T10:30:00` |
| Json | Objects or arrays | `{"key": "value"}` |

When using **Auto-Detect**, the node will infer the type from the value format.

## Compatibility

- **Camunda 7**: Version 7.15 and later
- **n8n**: Version 0.5.0 and later
- **Node.js**: Version 18.10 and later

## Resources

- [Camunda 7 REST API Documentation](https://docs.camunda.org/manual/7.21/reference/rest/)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Camunda 7 Getting Started Guide](https://docs.camunda.org/get-started/)

## Related Projects

- [Catalyst Connector](https://github.com/AlainJaques22/catalyst-connector) - Bidirectional integration between Camunda and external systems

## License

[MIT](LICENSE)
