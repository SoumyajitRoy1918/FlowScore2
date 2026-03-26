from fastapi import APIRouter
from .. import final_score as opai

router = APIRouter()

@router.get("/analysis")
def get_score():
    score = opai.getMainCredit()

    return {
        "score":score
    }
