"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from portfolio import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('accounts/', include('accounts.urls')),
    path('add-project/', views.add_project, name='add_project'),
    path('edit-project/<int:project_id>/', views.edit_project, name='edit_project'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('add-skill/', views.add_skill, name='add_skill'),
    path('edit-profile/', views.edit_profile, name='edit_profile'),
    path('add-education/', views.add_education, name='add_education'),
path('add-experience/', views.add_experience, name='add_experience'),


path(
    'edit-skill/<int:skill_id>/',
    views.edit_skill,
    name='edit_skill'
),

path(
    'delete-skill/<int:skill_id>/',
    views.delete_skill,
    name='delete_skill'
),

path(
    'delete-project/<int:project_id>/',
    views.delete_project,
    name='delete_project'
),


path(
    'edit-education/<int:education_id>/',
    views.edit_education,
    name='edit_education'
),

path(
    'delete-education/<int:education_id>/',
    views.delete_education,
    name='delete_education'
),

path(
    'edit-experience/<int:experience_id>/',
    views.edit_experience,
    name='edit_experience'
),

path(
    'delete-experience/<int:experience_id>/',
    views.delete_experience,
    name='delete_experience'
),
path(
    'portfolio/<str:username>/',
    views.public_portfolio,
    name='public_portfolio'
),

path(
    'resume/<str:username>/',
    views.public_resume,
    name='public_resume'
),



]