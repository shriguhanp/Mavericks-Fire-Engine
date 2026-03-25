from pydantic import BaseModel
from typing import Dict, Any, List, Optional, TypedDict
from models import AgentState, UserInput, SipPlan, PhaseBreakdown, FirePlanOutput, MonthlyTarget, TaxAnalysis

class GraphState(TypedDict):
    user_input: UserInput
    validation_status: str
    target_corpus: float
    sip_plan: SipPlan
    phases: List[PhaseBreakdown]
    asset_allocation: Dict[str, str]
    insurance_gap: Dict[str, str]
    tax_analysis: Optional[TaxAnalysis]
    monthly_roadmap: List[MonthlyTarget]
    yearly_glidepath: Dict[int, Dict[str, float]]
    earliest_retirement_age: Optional[int]
    final_output: FirePlanOutput
    errors: List[str]
