package com.example.goquiz

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.FormatListBulleted
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class StudentHome : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            StudentHomeScreen(
                onStartQuiz = {
                    startActivity(Intent(this, QuizTestActivity::class.java))
                },
                onNavigateToQuizzes = {
                    startActivity(Intent(this, QuizzesActivity::class.java))
                },
                onNavigateToProfile = {
                    startActivity(Intent(this, UserProfileActivity::class.java))
                }
            )
        }
    }
}

@Composable
fun StudentHomeScreen(
    onStartQuiz: () -> Unit = {},
    onNavigateToQuizzes: () -> Unit = {},
    onNavigateToProfile: () -> Unit = {}
) {
    val calendar = Calendar.getInstance()
    val formatter = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
    val current = formatter.format(calendar.time)
    val wishString = when {
        current < "12:00:00" -> "Good Morning"
        current < "18:00:00" -> "Good Afternoon"
        else -> "Good Evening"
    }
    val user = "John Doe"

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundLight)
            .windowInsetsPadding(WindowInsets.safeDrawing)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(bottom = 72.dp) // leave space for bottom nav
        ) {
            // ── Top App Bar ──────────────────────────────────────────────
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 20.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .background(VibrantGradient, RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Rounded.Star, contentDescription = "Logo", tint = Color.White)
                    }
                    Text(
                        text = "GoQuiz",
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp,
                        color = TextDark
                    )
                }
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .background(VibrantGradient, RoundedCornerShape(10.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Rounded.Notifications, contentDescription = "Notifications", tint = Color.White)
                }
            }

            // ── Greeting Banner ──────────────────────────────────────────
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(VibrantGradient)
                    .padding(20.dp)
            ) {
                Column {
                    Text(
                        text = "$wishString,",
                        color = Color.White.copy(alpha = 0.85f),
                        fontSize = 16.sp
                    )
                    Text(
                        text = user,
                        color = Color.White,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "You have 1 quiz available today!",
                        color = Color.White.copy(alpha = 0.9f),
                        fontSize = 13.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // ── Available Quizzes ────────────────────────────────────────
            SectionHeader(title = "Available Quizzes", onSeeMore = { /* TODO */ })

            Spacer(modifier = Modifier.height(12.dp))

            QuizCard(
                title = "Mathematics – Chapter 5",
                subject = "Mathematics",
                duration = "30 min",
                questions = "20 Questions",
                dueDate = "Due: Today",
                isAvailable = true,
                onStartClick = onStartQuiz
            )

            Spacer(modifier = Modifier.height(28.dp))

            // ── Past Quizzes ─────────────────────────────────────────────
            SectionHeader(title = "Past Quizzes", onSeeMore = { /* TODO */ })

            Spacer(modifier = Modifier.height(12.dp))

            PastQuizCard(
                title = "Science – Chapter 3",
                subject = "Science",
                score = "85%",
                date = "Feb 28, 2026",
                status = "Passed"
            )

            Spacer(modifier = Modifier.height(16.dp))
        }

        // ── Bottom Navigation ────────────────────────────────────────────
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .background(Color.White)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp, horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                BottomNavItem(icon = Icons.Rounded.Home, label = "Home", isSelected = true)
                BottomNavItem(icon = Icons.AutoMirrored.Rounded.FormatListBulleted, label = "Quizzes", isSelected = false, onClick = onNavigateToQuizzes)
                BottomNavItem(icon = Icons.Rounded.Person, label = "Profile", isSelected = false, onClick = onNavigateToProfile)
            }
        }
    }
}

// ── Reusable Section Header ──────────────────────────────────────────────────
@Composable
fun SectionHeader(title: String, onSeeMore: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = title,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = TextDark
        )
        Text(
            text = "See More",
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
            style = TextStyle(brush = VibrantGradient),
            modifier = Modifier.clickable { onSeeMore() }
        )
    }
}

// ── Available Quiz Card ───────────────────────────────────────────────────────
@Composable
fun QuizCard(
    title: String,
    subject: String,
    duration: String,
    questions: String,
    dueDate: String,
    @Suppress("UNUSED_PARAMETER") isAvailable: Boolean,
    onStartClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            // Subject chip + due date
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .background(PrimaryOrange.copy(alpha = 0.12f), RoundedCornerShape(20.dp))
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(text = subject, color = PrimaryOrange, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                }
                Text(text = dueDate, color = SecondaryCoral, fontSize = 12.sp, fontWeight = FontWeight.Medium)
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(text = title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TextDark)

            Spacer(modifier = Modifier.height(8.dp))

            // Meta info row
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(Icons.Rounded.DateRange, contentDescription = null, tint = TextGray, modifier = Modifier.size(14.dp))
                    Text(text = duration, color = TextGray, fontSize = 12.sp)
                }
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(Icons.AutoMirrored.Rounded.FormatListBulleted, contentDescription = null, tint = TextGray, modifier = Modifier.size(14.dp))
                    Text(text = questions, color = TextGray, fontSize = 12.sp)
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Start Button
            Button(
                onClick = onStartClick,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                contentPadding = PaddingValues()
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(VibrantGradient, RoundedCornerShape(10.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("Start Quiz", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            }
        }
    }
}

// ── Past Quiz Card ────────────────────────────────────────────────────────────
@Composable
fun PastQuizCard(
    title: String,
    subject: String,
    score: String,
    date: String,
    status: String
) {
    val statusColor = if (status == "Passed") Color(0xFF22C55E) else SecondaryCoral

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Row(
            modifier = Modifier.padding(18.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Score circle
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .background(VibrantGradient, RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(text = score, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp, textAlign = TextAlign.Center)
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(text = title, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = TextDark)
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .background(PrimaryOrange.copy(alpha = 0.12f), RoundedCornerShape(20.dp))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(text = subject, color = PrimaryOrange, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                    }
                    Text(text = date, color = TextGray, fontSize = 11.sp)
                }
            }

            // Status badge
            Box(
                modifier = Modifier
                    .background(statusColor.copy(alpha = 0.12f), RoundedCornerShape(20.dp))
                    .padding(horizontal = 10.dp, vertical = 5.dp)
            ) {
                Text(text = status, color = statusColor, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Preview(showBackground = true, device = "id:pixel_7_pro")
@Composable
fun StudentHomeScreenPreview() {
    StudentHomeScreen()
}
