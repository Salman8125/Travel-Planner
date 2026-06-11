from rest_framework.renderers import JSONRenderer


class EnvelopeJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        context = renderer_context or {}
        response = context.get("response")
        status_code = getattr(response, "status_code", 200)
        view = context.get("view")

        if getattr(view, "envelope_exempt", False):
            return super().render(data, accepted_media_type, renderer_context)

        if status_code == 204 or data is None:
            return b""

        if isinstance(data, dict):
            if "error" in data and status_code >= 400:
                return super().render(data, accepted_media_type, renderer_context)
            if "data" in data and "meta" in data:
                return super().render(data, accepted_media_type, renderer_context)

        return super().render({"data": data}, accepted_media_type, renderer_context)
