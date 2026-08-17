from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import home, ExpenseViewSet


router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename='expense')


urlpatterns = [
    path('', home, name='home'),
]

urlpatterns += router.urls 