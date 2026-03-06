package com.example.goquiz

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.FormatListBulleted
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// ── Data model ───────────────────────────────────────────────────────────────
data class QuizItem(
    val title: String,
    val description: String,
    val subject: String,
    val difficulty: String,
    val duration: String,
    val participantCount: String,
    val gradientColors: List<Color>
)

// ── Activity ──────────────────────────────────────────────────────────────────
class QuizzesActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            QuizzesScreen(
                onQuizClick = {
                    startActivity(Intent(this, QuizTestActivity::class.java))
                },
                onBack = { finish() },
                onNavigateToHome = {
                    startActivity(Intent(this, StudentHome::class.java))
                    finish()
                },
                onNavigateToProfile = {
                    startActivity(Intent(this, UserProfileActivity::class.java))
                }
            )
        }
    }
}

// ── Screen ────────────────────────────────────────────────────────────────────
@Composable
fun QuizzesScreen(
    onQuizClick: () -> Unit = {},
    onBack: () -> Unit = {},
    onNavigateToHome: () -> Unit = {},
    onNavigateToProfile: () -> Unit = {}
) {
    val categories = listOf("All Topics", "Mathematics", "Programming", "Physics")
    var selectedCategory by remember { mutableStateOf("All Topics") }
    var searchQuery by remember { mutableStateOf("") }

    val quizzes = listOf(
        QuizItem(
            title = "Advanced Calculus Basics",
            description = "Master the fundamental principles of limits, derivatives and integrals.",
            subject = "Math",
            difficulty = "Beginner",
            duration = "15 Mins",
            participantCount = "+12",
            gradientColors = listOf(Color(0xFFFB923C), Color(0xFFF27F0D))
        ),
        QuizItem(
            title = "Data Structures with Python",
            description = "Test your knowledge on lists, dictionaries, and algorithm efficiency.",
            subject = "Python",
            difficulty = "Intermediate",
            duration = "10 Mins",
            participantCount = "+45",
            gradientColors = listOf(Color(0xFFF27F0D), Color(0xFFFBBF24))
        ),
        QuizItem(
            title = "Quantum Mechanics 101",
            description = "Explore the weird world of wave-particle duality and Schrödinger's cat.",
            subject = "Physics",
            difficulty = "Expert",
            duration = "20 Mins",
            participantCount = "+8",
            gradientColors = listOf(Color(0xFFEA580C), Color(0xFFF27F0D))
        )
    )

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
                .padding(bottom = 72.dp)
        ) {
            // ── Header ────────────────────────────────────────────────────
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(BackgroundLight)
                    .padding(horizontal = 16.dp, vertical = 14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Rounded.Menu,
                    contentDescription = "Menu",
                    tint = PrimaryOrange,
                    modifier = Modifier.size(28.dp)
                )
                Text(
                    text = "Explore Quizzes",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextDark
                )
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .background(PrimaryOrange.copy(alpha = 0.12f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Rounded.AccountCircle,
                        contentDescription = "Profile",
                        tint = PrimaryOrange,
                        modifier = Modifier.size(26.dp)
                    )
                }
            }

            HorizontalDivider(color = PrimaryOrange.copy(alpha = 0.1f), thickness = 1.dp)

            Spacer(modifier = Modifier.height(12.dp))

            // ── Search Bar ────────────────────────────────────────────────
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.White)
                    .padding(horizontal = 12.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Rounded.Search, contentDescription = null, tint = PrimaryOrange.copy(alpha = 0.6f))
                Spacer(modifier = Modifier.width(8.dp))
                TextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = {
                        Text("Search quizzes by topic or name", color = TextGray.copy(alpha = 0.6f), fontSize = 14.sp)
                    },
                    singleLine = true,
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color.Transparent,
                        unfocusedContainerColor = Color.Transparent,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent
                    ),
                    modifier = Modifier.fillMaxWidth()
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // ── Category Chips ────────────────────────────────────────────
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                categories.forEach { cat ->
                    val isSelected = cat == selectedCategory
                    Box(
                        modifier = Modifier
                            .clip(CircleShape)
                            .background(
                                if (isSelected) PrimaryOrange
                                else Color.White
                            )
                            .clickable { selectedCategory = cat }
                            .padding(horizontal = 18.dp, vertical = 10.dp)
                    ) {
                        Text(
                            text = cat,
                            color = if (isSelected) Color.White else TextDark,
                            fontSize = 13.sp,
                            fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ── Section Header ─────────────────────────────────────────────
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Recommended for you", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextDark)

            }

            Spacer(modifier = Modifier.height(16.dp))

            // ── Quiz Cards ────────────────────────────────────────────────
            Column(
                modifier = Modifier.padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                quizzes.forEach { quiz ->
                    ExploreQuizCard(quiz = quiz)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }

        // ── Bottom Navigation ─────────────────────────────────────────────
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .background(Color.White.copy(alpha = 0.95f))
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp, horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                BottomNavItem(icon = Icons.Rounded.Home, label = "Home", isSelected = false, onClick = onNavigateToHome)
                BottomNavItem(icon = Icons.AutoMirrored.Rounded.FormatListBulleted, label = "Quizzes", isSelected = true)
                BottomNavItem(icon = Icons.Rounded.Person, label = "Profile", isSelected = false, onClick = onNavigateToProfile)
            }
        }
    }
}

// ── Explore Quiz Card ─────────────────────────────────────────────────────────
@Composable
fun ExploreQuizCard(quiz: QuizItem) {
    val difficultyColor = when (quiz.difficulty) {
        "Beginner" -> PrimaryOrange
        "Intermediate" -> Color(0xFFEA580C)
        "Expert" -> Color(0xFFDC2626)
        else -> PrimaryOrange
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            // Gradient Banner
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp)
                    .background(
                        Brush.linearGradient(colors = quiz.gradientColors)
                    )
            ) {
                // Duration badge (top-right)
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(10.dp)
                        .clip(RoundedCornerShape(6.dp))
                        .background(Color.White.copy(alpha = 0.25f))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = quiz.duration.uppercase(),
                        color = Color.White,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Column(modifier = Modifier.padding(14.dp)) {
                // Difficulty + Subject chips
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(difficultyColor.copy(alpha = 0.12f))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            quiz.difficulty.uppercase(),
                            color = difficultyColor,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(Color(0xFFF1F5F9))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            quiz.subject.uppercase(),
                            color = TextGray,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = quiz.title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextDark
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = quiz.description,
                    fontSize = 13.sp,
                    color = TextGray,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Participants + Start button
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Participant avatars stack
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        repeat(2) { idx ->
                            Box(
                                modifier = Modifier
                                    .size(24.dp)
                                    .offset(x = (-idx * 8).dp)
                                    .clip(CircleShape)
                                    .background(if (idx == 0) Color(0xFFCBD5E1) else Color(0xFFE2E8F0))
                            )
                        }
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .offset(x = (-16).dp)
                                .clip(CircleShape)
                                .background(PrimaryOrange.copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(quiz.participantCount, color = PrimaryOrange, fontSize = 7.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Button(
                        onClick = { },
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryOrange),
                        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp)
                    ) {
                        Text("Start", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }
        }
    }
}

// ── Preview ───────────────────────────────────────────────────────────────────
@Preview(showBackground = true, device = "id:pixel_7_pro")
@Composable
fun QuizzesScreenPreview() {
    QuizzesScreen()
}
