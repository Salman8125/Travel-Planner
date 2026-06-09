# Single stage (interpreted language, no compile step). Slim base.
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
EXPOSE 4003
# --host 0.0.0.0 is mandatory (Uvicorn defaults to 127.0.0.1, unreachable from outside).
# Single worker keeps the in-memory budget state consistent.
CMD ["uvicorn", "app.http.main:app", "--host", "0.0.0.0", "--port", "4003", "--workers", "1"]
