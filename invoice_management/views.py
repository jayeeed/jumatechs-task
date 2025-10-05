from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import logging

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    Simple health check endpoint that returns the status of the application.
    """
    try:
        return JsonResponse(
            {"status": "healthy", "message": "Application is running smoothly"}
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JsonResponse(
            {"status": "unhealthy", "message": "Application is experiencing issues"},
            status=500,
        )
