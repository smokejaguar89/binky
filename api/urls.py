from django.conf.urls import url, include
from api import views
from rest_framework.routers import DefaultRouter
from rest_framework.schemas import get_schema_view

schema_view = get_schema_view(title='Pastebin API')

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'skills', views.SkillViewSet)
router.register(r'projects', views.ProjectViewSet)
router.register(r'users', views.UserViewSet)
router.register(r'projectcategories', views.ProjectCategoryViewSet)
router.register(r'universities', views.UniversityViewSet)
router.register(r'locations', views.LocationViewSet)
router.register(r'posts', views.PostViewSet)


# The API URLs are now determined automatically by the router.
# Additionally, we include the login URLs for the browsable API.
urlpatterns = [
	url('^schema/$', schema_view),
    url(r'^', include(router.urls)),
    url(r'activate/(?P<key>[\w\-]+)', views.activate_user),
    url(r'recommended_projects/', views.recommended_projects),
    url(r'login_user/', views.login_user),
    url(r'logout_user/', views.logout_user),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]