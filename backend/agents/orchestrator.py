from langgraph.graph import StateGraph, END
from agents.state import GraphState
from models import UserInput
from agents.agent_nodes import input_agent, planning_agent, allocation_agent, risk_agent, output_agent, tax_agent

async def run_fire_agents(user_input: UserInput):
    workflow = StateGraph(GraphState)

    workflow.add_node("input", input_agent)
    workflow.add_node("taxation", tax_agent)
    workflow.add_node("planning", planning_agent)
    workflow.add_node("allocation", allocation_agent)
    workflow.add_node("risk", risk_agent)
    workflow.add_node("output", output_agent)

    workflow.set_entry_point("input")

    def should_continue(state: GraphState):
        if state.get("validation_status") == "invalid":
            return END
        return "taxation"

    workflow.add_conditional_edges("input", should_continue, {"taxation": "taxation", END: END})
    workflow.add_edge("taxation", "planning")
    workflow.add_edge("planning", "allocation")
    workflow.add_edge("allocation", "risk")
    workflow.add_edge("risk", "output")
    workflow.add_edge("output", END)

    app = workflow.compile()
    
    initial_state = {"user_input": user_input, "errors": []}
    
    # Run graph async
    result = await app.ainvoke(initial_state)
    return result
