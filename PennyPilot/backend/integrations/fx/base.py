from decimal import Decimal
from typing import Protocol


class FxProvider(Protocol):
    def convert(self, amount: Decimal, from_currency: str, to_currency: str) -> Decimal: ...
