package com.example.goquiz

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// ── Data ──────────────────────────────────────────────────────────────────────
data class ReviewQuestion(
    val questionNumber: Int,
    val questionText: String,
    val isCorrect: Boolean,
    val yourAnswer: String,
    val correctAnswer: String,
    val aiExplanation: String? = null   // null = correct, no explanation needed
)

private val sampleReview = listOf(
    ReviewQuestion(
        questionNumber = 4,
        questionText = "What is the primary function of the mitochondria in a cell?",
        isCorrect = false,
        yourAnswer = "Protein synthesis",
        correctAnswer = "Energy production (ATP)",
        aiExplanation = "The mitochondria are known as the \"powerhouse\" of the cell. They generate chemical energy in the form of ATP through cellular respiration. Ribosomes, not mitochondria, are responsible for protein synthesis."
    ),
    ReviewQuestion(
        questionNumber = 7,
        questionText = "Which planet is known as the Red Planet?",
        isCorrect = true,
        yourAnswer = "Mars",
        correctAnswer = "Mars"
    )
)

// ── Activity ──────────────────────────────────────────────────────────────────
class QuizResultActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val score = intent.getIntExtra("score", 0)
        val total = intent.getIntExtra("total", 0)
        val scorePercent = if (total > 0) (score * 100) / total else 0
        setContent {
            QuizResultScreen(
                scorePercent = scorePercent,
                correctCount = score,
                incorrectCount = total - score,
                onBack = { finish() },
                onRetake = {
                    startActivity(Intent(this, QuizTestActivity::class.java))
                    finish()
                },
                onShare = { /* TODO: Share result */ }
            )
        }
    }
}

// ── Screen ────────────────────────────────────────────────────────────────────
@Composable
fun QuizResultScreen(
    scorePercent: Int = 85,
    correctCount: Int = 8,
    incorrectCount: Int = 2,
    reviewQuestions: List<ReviewQuestion> = sampleReview,
    onBack: () -> Unit = {},
    onRetake: () -> Unit = {},
    onShare: () -> Unit = {}
) {
    // Animate the arc from 0 → scorePercent on first composition
    var animTarget by remember { mutableFloatStateOf(0f) }
    LaunchedEffect(Unit) { animTarget = scorePercent / 100f }
    val animatedScore by animateFloatAsState(
        targetValue = animTarget,
        animationSpec = tween(durationMillis = 1200),
        label = "scoreArc"
    )

    val passed = scorePercent >= 60
    val GreenPass = Color(0xFF22C55E)

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
                .padding(bottom = 32.dp)
        ) {

            // ── Top Bar ───────────────────────────────────────────────────
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp)
            ) {
                // Back
                Box(
                    modifier = Modifier
                        .align(Alignment.CenterStart)
                        .size(42.dp)
                        .clip(CircleShape)
                        .background(PrimaryOrange.copy(alpha = 0.10f))
                        .clickable { onBack() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.AutoMirrored.Rounded.ArrowBack,
                        contentDescription = "Back",
                        tint = PrimaryOrange,
                        modifier = Modifier.size(22.dp)
                    )
                }

                // Title
                Text(
                    text = "Quiz Results",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextDark,
                    modifier = Modifier.align(Alignment.Center)
                )

                // Share
                Box(
                    modifier = Modifier
                        .align(Alignment.CenterEnd)
                        .size(42.dp)
                        .clip(CircleShape)
                        .background(PrimaryOrange.copy(alpha = 0.10f))
                        .clickable { onShare() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Rounded.Share,
                        contentDescription = "Share",
                        tint = PrimaryOrange,
                        modifier = Modifier.size(22.dp)
                    )
                }
            }

            // ── Hero Score Ring ───────────────────────────────────────────
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier.size(200.dp),
                    contentAlignment = Alignment.Center
                ) {
                    ScoreRing(
                        progress = animatedScore,
                        trackColor = PrimaryOrange.copy(alpha = 0.12f),
                        arcColor = PrimaryOrange,
                        modifier = Modifier.fillMaxSize()
                    )
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "$scorePercent%",
                            fontSize = 46.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextDark
                        )
                        Text(
                            text = "Overall Score",
                            fontSize = 13.sp,
                            color = TextGray,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                Text(
                    text = if (passed) "Excellent Work! 🎉" else "Keep Practicing! 💪",
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextDark,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = if (passed) "You're in the top 10% of learners!" else "Review the material and try again.",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = PrimaryOrange,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(16.dp))

                // View Leaderboard button
                val context = LocalContext.current
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .height(56.dp)
                        .clickable {
                            context.startActivity(Intent(context, LeaderBoardActivity::class.java))
                        },
                    shape = RoundedCornerShape(14.dp),
                    color = PrimaryOrange
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text("View Leaderboard", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    }
                }
            }

            // ── Summary Stats ─────────────────────────────────────────────
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StatCard(
                    modifier = Modifier.weight(1f),
                    icon = Icons.Rounded.CheckCircle,
                    iconColor = GreenPass,
                    label = "Correct",
                    value = correctCount.toString()
                )
                StatCard(
                    modifier = Modifier.weight(1f),
                    icon = Icons.Rounded.Close,
                    iconColor = SecondaryCoral,
                    label = "Incorrect",
                    value = incorrectCount.toString()
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ── Review & AI Insights ──────────────────────────────────────
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "Review & AI Insights",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextDark
                )
                Icon(
                    Icons.Rounded.Star,
                    contentDescription = null,
                    tint = PrimaryOrange,
                    modifier = Modifier.size(22.dp)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Column(
                modifier = Modifier.padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                reviewQuestions.forEach { review ->
                    ReviewCard(review = review)
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // ── Action Buttons ────────────────────────────────────────────
            Column(
                modifier = Modifier.padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Retake — gradient fill
                Button(
                    onClick = onRetake,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                    contentPadding = PaddingValues()
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(VibrantGradient, RoundedCornerShape(14.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(Icons.Rounded.Refresh, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
                            Text("Retake Quiz", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        }
                    }
                }

                // Share — outlined with orange border
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .clickable { onShare() },
                    shape = RoundedCornerShape(14.dp),
                    color = Color.White,
                    border = androidx.compose.foundation.BorderStroke(2.dp, PrimaryOrange)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(Icons.Rounded.Share, contentDescription = null, tint = PrimaryOrange, modifier = Modifier.size(20.dp))
                            Text("Share Results", color = PrimaryOrange, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        }
                    }
                }

            }
        }
    }
}

// ── Circular Score Ring ───────────────────────────────────────────────────────
@Composable
fun ScoreRing(
    progress: Float,
    trackColor: Color,
    arcColor: Color,
    modifier: Modifier = Modifier
) {
    Canvas(modifier = modifier) {
        val stroke = 28f
        val inset = stroke / 2f
        val topLeft = Offset(inset, inset)
        val arcSize = Size(size.width - stroke, size.height - stroke)

        // Track (full circle)
        drawArc(
            color = trackColor,
            startAngle = -90f,
            sweepAngle = 360f,
            useCenter = false,
            topLeft = topLeft,
            size = arcSize,
            style = Stroke(width = stroke, cap = StrokeCap.Round)
        )

        // Progress arc
        drawArc(
            color = arcColor,
            startAngle = -90f,
            sweepAngle = 360f * progress,
            useCenter = false,
            topLeft = topLeft,
            size = arcSize,
            style = Stroke(width = stroke, cap = StrokeCap.Round)
        )
    }
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
@Composable
fun StatCard(
    modifier: Modifier = Modifier,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconColor: Color,
    label: String,
    value: String
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(icon, contentDescription = null, tint = iconColor, modifier = Modifier.size(22.dp))
                Text(label, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = TextGray)
            }
            Text(value, fontSize = 32.sp, fontWeight = FontWeight.Bold, color = TextDark)
        }
    }
}

// ── Review Card ───────────────────────────────────────────────────────────────
@Composable
fun ReviewCard(review: ReviewQuestion) {
    val GreenPass = Color(0xFF22C55E)

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {

            // Header row: Q badge + correct/wrong icon
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(PrimaryOrange.copy(alpha = 0.12f))
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        "Question ${review.questionNumber}",
                        color = PrimaryOrange,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Icon(
                    imageVector = if (review.isCorrect) Icons.Rounded.CheckCircle else Icons.Rounded.Close,
                    contentDescription = null,
                    tint = if (review.isCorrect) GreenPass else SecondaryCoral,
                    modifier = Modifier.size(22.dp)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Question text
            Text(
                text = review.questionText,
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
                color = TextDark,
                lineHeight = 22.sp
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Your answer
            if (!review.isCorrect) {
                AnswerBox(
                    label = "YOUR ANSWER",
                    answer = review.yourAnswer,
                    labelColor = SecondaryCoral,
                    borderColor = SecondaryCoral.copy(alpha = 0.35f),
                    bgColor = SecondaryCoral.copy(alpha = 0.06f)
                )
                Spacer(modifier = Modifier.height(8.dp))
            }

            // Correct answer
            AnswerBox(
                label = if (review.isCorrect) "YOUR ANSWER" else "CORRECT ANSWER",
                answer = review.correctAnswer,
                labelColor = GreenPass,
                borderColor = GreenPass.copy(alpha = 0.35f),
                bgColor = GreenPass.copy(alpha = 0.06f)
            )

            // AI Explanation (only for wrong answers)
            if (review.aiExplanation != null) {
                Spacer(modifier = Modifier.height(12.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color(0xFFF8F7F5))
                        .border(
                            width = 3.dp,
                            color = PrimaryOrange,
                            shape = RoundedCornerShape(
                                topStart = 0.dp, bottomStart = 0.dp,
                                topEnd = 10.dp, bottomEnd = 10.dp
                            )
                        )
                        // left-side accent bar via a side border trick using padding + nested box
                ) {
                    Row {
                        // Orange left accent bar
                        Box(
                            modifier = Modifier
                                .width(4.dp)
                                .fillMaxHeight()
                                .background(PrimaryOrange)
                        )
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(
                                    Icons.Rounded.Info,
                                    contentDescription = null,
                                    tint = PrimaryOrange,
                                    modifier = Modifier.size(16.dp)
                                )
                                Text(
                                    "AI EXPLANATION",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextDark
                                )
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = review.aiExplanation,
                                fontSize = 13.sp,
                                color = TextGray,
                                lineHeight = 20.sp
                            )
                        }
                    }
                }
            }
        }
    }
}

// ── Answer Box ────────────────────────────────────────────────────────────────
@Composable
fun AnswerBox(
    label: String,
    answer: String,
    labelColor: Color,
    borderColor: Color,
    bgColor: Color
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .background(bgColor)
            .border(width = 1.dp, color = borderColor, shape = RoundedCornerShape(10.dp))
            .padding(12.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(label, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = labelColor)
            Text(answer, fontSize = 14.sp, color = TextDark, fontWeight = FontWeight.Medium)
        }
    }
}

// ── Preview ───────────────────────────────────────────────────────────────────
@Preview(showBackground = true, device = "id:pixel_7_pro")
@Composable
fun QuizResultScreenPreview() {
    QuizResultScreen()
}
