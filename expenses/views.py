from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Expense
from .forms import ExpenseForm
from django.db.models import Sum
from django.utils import timezone

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .serializers import ExpenseSerializer


@login_required
def home(request):
    if request.method == "POST":
        form = ExpenseForm(request.POST)

        if form.is_valid():
            expense = form.save(commit=False)
            expense.owner = request.user
            expense.save()
            return redirect("home")
    else:
        form = ExpenseForm()

    today = timezone.now().date()

    expenses = Expense.objects.filter(
        owner=request.user
    ).order_by("-date", "-id")

    this_month_expenses = expenses.filter(
        date__year=today.year,
        date__month=today.month
    )

    total = this_month_expenses.aggregate(
        total=Sum("amount")
    )["total"] or 0

    context = {
        "form": form,
        "expenses": expenses,
        "total": total,
    }

    return render(request, "expenses/home.html", context)


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(
            owner=self.request.user
        ).order_by("-date", "-id")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)