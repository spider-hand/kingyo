from rest_framework import routers
from .views import TestPlanViewSet

router = routers.DefaultRouter()
router.register(r"testplans", TestPlanViewSet)

urlpatterns = router.urls
