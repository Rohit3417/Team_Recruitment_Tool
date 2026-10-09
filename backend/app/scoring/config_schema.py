from enum import Enum
from typing import List, Union
from pydantic import BaseModel, Field

class RuleScope(str, Enum):
    ANY_MEMBER = "any_member"
    ALL_MEMBERS = "all_members"
    TEAM = "team"

class AggregationMethod(str, Enum):
    MEAN = "mean"
    WEIGHTED_MEAN = "weighted_mean"
    AT_LEAST_ONE = "at_least_one"

class MissingPolicy(str, Enum):
    REDISTRIBUTE = "redistribute"
    NEUTRAL = "neutral"
    PENALTY = "penalty"

class Criterion(BaseModel):
    name: str = Field(..., description="e.g., technical_skills, projects, github_activity")
    weight: int = Field(..., ge=0, le=100)
    keywords: List[str] = Field(default_factory=list, description="Keywords for the parser to match")

class EligibilityRule(BaseModel):
    signal: str = Field(..., description="The exact signal name, e.g., github.contributions_12m")
    operator: str = Field(..., description="e.g., '>=', '==', 'contains'")
    value: Union[int, float, str, bool]
    scope: RuleScope

class ScoringConfiguration(BaseModel):
    criteria: List[Criterion]
    eligibility_rules: List[EligibilityRule]
    top_x: int = Field(..., ge=1, description="Number of teams to shortlist")
    aggregation: AggregationMethod
    missing_policy: MissingPolicy
    tie_break: List[str] = Field(..., description="Chain of criteria to resolve ties, ending in team_id")