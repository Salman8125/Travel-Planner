from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class EnvelopePageNumberPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "pageSize"
    max_page_size = 100

    def get_paginated_response(self, data):
        total = self.page.paginator.count
        page_size = self.get_page_size(self.request) or self.page_size
        total_pages = max(1, -(-total // page_size))
        return Response(
            {
                "data": data,
                "meta": {
                    "page": self.page.number,
                    "pageSize": page_size,
                    "total": total,
                    "totalPages": total_pages,
                },
            }
        )
