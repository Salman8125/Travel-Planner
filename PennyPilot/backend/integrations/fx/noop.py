from decimal import Decimal


class NoopFxProvider:
    def convert(self, amount: Decimal, from_currency: str, to_currency: str) -> Decimal:
        if from_currency != to_currency:
            raise ValueError("FX conversion is not supported in this scope")
        return amount
