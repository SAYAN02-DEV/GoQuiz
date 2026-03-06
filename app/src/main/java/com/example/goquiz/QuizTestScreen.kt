package com.example.goquiz

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
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
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

// ── Data ──────────────────────────────────────────────────────────────────────
data class QuizQuestion(
    val question: String,
    val options: List<String>,
    val correctIndex: Int
)

private val sampleQuestions = listOf(
    QuizQuestion(
        question = "What is the derivative of sin(x)?",
        options = listOf("cos(x)", "-cos(x)", "-sin(x)", "tan(x)"),
        correctIndex = 0
    ),
    QuizQuestion(
        question = "Which data structure uses LIFO order?",
        options = listOf("Queue", "Stack", "Linked List", "Heap"),
        correctIndex = 1
    ),
    QuizQuestion(
        question = "What is the time complexity of binary search?",
        options = listOf("O(n)", "O(n²)", "O(log n)", "O(1)"),
        correctIndex = 2
    ),
    QuizQuestion(
        question = "What does CPU stand for?",
        options = listOf(
            "Central Processing Unit",
            "Central Program Unit",
            "Computer Personal Unit",
            "Core Processing Unit"
        ),
        correctIndex = 0
    ),
    QuizQuestion(
        question = "Which of these is NOT a programming paradigm?",
        options = listOf("Object-Oriented", "Functional", "Declarative", "Sequential"),
        correctIndex = 3
    )
)

// ── Activity ──────────────────────────────────────────────────────────────────
class QuizTestActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            QuizTestScreen(
                onFinish = { score, total ->
                    val intent = Intent()
                    intent.setClassName(this@QuizTestActivity, "com.example.goquiz.QuizResultActivity")
                    intent.putExtra("score", score)
                    intent.putExtra("total", total)
                    startActivity(intent)
                    finish()
                },
                onBack = { finish() }
            )
        }
    }
}

// ── Screen ────────────────────────────────────────────────────────────────────
@Composable
fun QuizTestScreen(
    quizTitle: String = "Mathematics – Chapter 5",
    subject: String = "Mathematics",
    totalTimeSeconds: Int = 30 * 60,   // 30 minutes
    onFinish: (score: Int, total: Int) -> Unit = { _, _ -> },
    onBack: () -> Unit = {}
) {
    val questions = sampleQuestions
    var currentIndex by remember { mutableStateOf(0) }
    val selectedAnswers = remember { mutableStateListOf<Int?>().also { list ->
        repeat(questions.size) { list.add(null) }
    }}
    var timeLeft by remember { mutableIntStateOf(totalTimeSeconds) }
    var isFinished by remember { mutableStateOf(false) }

    // ── Countdown timer ───────────────────────────────────────────────────────
    LaunchedEffect(isFinished) {
        if (!isFinished) {
            while (timeLeft > 0) {
                delay(1000L)
                timeLeft--
            }
            isFinished = true
        }
    }

    val minutes = timeLeft / 60
    val seconds = timeLeft % 60
    val timerWarning = timeLeft <= 60

    val progressFraction = (currentIndex + 1).toFloat() / questions.size.toFloat()
    val animatedProgress by animateFloatAsState(
        targetValue = progressFraction,
        animationSpec = tween(400),
        label = "progress"
    )

    val currentQuestion = questions[currentIndex]

    // ── Result dialog ─────────────────────────────────────────────────────────
    if (isFinished) {
        val score = selectedAnswers.mapIndexed { i, sel ->
            if (sel == questions[i].correctIndex) 1 else 0
        }.sum()
        QuizResultDialog(
            score = score,
            total = questions.size,
            onDismiss = { onFinish(score, questions.size) }
        )
    }

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
            // ── Header ────────────────────────────────────────────────────
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(VibrantGradient)
                    .padding(horizontal = 16.dp, vertical = 14.dp)
            ) {
                // Back button
                Box(
                    modifier = Modifier
                        .align(Alignment.CenterStart)
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.22f))
                        .clickable { onBack() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.AutoMirrored.Rounded.ArrowBack,
                        contentDescription = "Back",
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }

                // Title
                Column(
                    modifier = Modifier.align(Alignment.Center),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = quizTitle,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = subject,
                        color = Color.White.copy(alpha = 0.8f),
                        fontSize = 12.sp
                    )
                }

                // Question counter
                Box(
                    modifier = Modifier
                        .align(Alignment.CenterEnd)
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color.White.copy(alpha = 0.22f))
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "${currentIndex + 1}/${questions.size}",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                }
            }

            // ── Progress bar ──────────────────────────────────────────────
            Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        "Progress",
                        fontSize = 12.sp,
                        color = TextGray,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        "${(progressFraction * 100).toInt()}%",
                        fontSize = 12.sp,
                        color = PrimaryOrange,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                Spacer(modifier = Modifier.height(6.dp))
                LinearProgressIndicator(
                    progress = { animatedProgress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(CircleShape),
                    color = PrimaryOrange,
                    trackColor = PrimaryOrange.copy(alpha = 0.15f),
                    strokeCap = StrokeCap.Round
                )
            }

            // ── Timer + Question info row ──────────────────────────────────
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Timer pill
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(
                            if (timerWarning) SecondaryCoral.copy(alpha = 0.12f)
                            else PrimaryOrange.copy(alpha = 0.10f)
                        )
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        Icons.Rounded.DateRange,
                        contentDescription = "Timer",
                        tint = if (timerWarning) SecondaryCoral else PrimaryOrange,
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = "%02d:%02d".format(minutes, seconds),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (timerWarning) SecondaryCoral else PrimaryOrange
                    )
                }

                // Answered count
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color(0xFF22C55E).copy(alpha = 0.10f))
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        Icons.Rounded.CheckCircle,
                        contentDescription = null,
                        tint = Color(0xFF22C55E),
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = "${selectedAnswers.count { it != null }} answered",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF22C55E)
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // ── Question Card ─────────────────────────────────────────────
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    // Q number badge
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(VibrantGradient)
                            .padding(horizontal = 12.dp, vertical = 5.dp)
                    ) {
                        Text(
                            "Question ${currentIndex + 1}",
                            color = Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.height(14.dp))
                    Text(
                        text = currentQuestion.question,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextDark,
                        lineHeight = 26.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // ── Options ───────────────────────────────────────────────────
            val optionLabels = listOf("A", "B", "C", "D")
            Column(
                modifier = Modifier.padding(horizontal = 20.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                currentQuestion.options.forEachIndexed { idx, option ->
                    val isSelected = selectedAnswers[currentIndex] == idx
                    OptionCard(
                        label = optionLabels.getOrElse(idx) { "${idx + 1}" },
                        text = option,
                        isSelected = isSelected,
                        onClick = { selectedAnswers[currentIndex] = idx }
                    )
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // ── Navigation row ────────────────────────────────────────────
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Previous — always visible, light orange fill, disabled on first question
                val isPrevEnabled = currentIndex > 0
                Button(
                    onClick = { if (isPrevEnabled) currentIndex-- },
                    modifier = Modifier
                        .weight(1f)
                        .height(52.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFFFE0B2),   // very light orange
                        contentColor = PrimaryOrange,
                        disabledContainerColor = Color(0xFFFFE0B2).copy(alpha = 0.45f),
                        disabledContentColor = PrimaryOrange.copy(alpha = 0.35f)
                    ),
                    enabled = isPrevEnabled
                ) {
                    Icon(
                        Icons.AutoMirrored.Rounded.ArrowBack,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Previous", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                }

                // Next / Submit
                val isLast = currentIndex == questions.size - 1
                Button(
                    onClick = {
                        if (isLast) isFinished = true
                        else currentIndex++
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(52.dp),
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
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text(
                                if (isLast) "Submit" else "Next",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                            Icon(
                                if (isLast) Icons.Rounded.Check else Icons.AutoMirrored.Rounded.ArrowForward,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

// ── Option Card ───────────────────────────────────────────────────────────────
@Composable
fun OptionCard(
    label: String,
    text: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val bgColor = if (isSelected) PrimaryOrange.copy(alpha = 0.08f) else Color.White
    val labelBg = if (isSelected) VibrantGradient else null
    val labelColor = if (isSelected) Color.White else TextGray

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(bgColor)
            .border(
                width = if (isSelected) 1.5.dp else 1.dp,
                color = if (isSelected) PrimaryOrange else Color(0xFFE2E8F0),
                shape = RoundedCornerShape(14.dp)
            )
            .clickable { onClick() }
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Label circle
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .let { m ->
                    if (labelBg != null) m.background(labelBg)
                    else m.background(Color(0xFFF1F5F9))
                },
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = label,
                color = labelColor,
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )
        }

        Text(
            text = text,
            color = if (isSelected) TextDark else TextGray,
            fontSize = 15.sp,
            fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
            modifier = Modifier.weight(1f)
        )

        if (isSelected) {
            Icon(
                Icons.Rounded.CheckCircle,
                contentDescription = null,
                tint = PrimaryOrange,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

// ── Result Dialog ─────────────────────────────────────────────────────────────
@Composable
fun QuizResultDialog(score: Int, total: Int, onDismiss: () -> Unit) {
    val percent = (score.toFloat() / total * 100).toInt()
    val passed = percent >= 60

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = Color.White,
        shape = RoundedCornerShape(24.dp),
        title = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(72.dp)
                        .clip(CircleShape)
                        .background(VibrantGradient),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        if (passed) Icons.Rounded.Star else Icons.Rounded.Refresh,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(36.dp)
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    if (passed) "🎉 Congratulations!" else "Keep Practicing!",
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp,
                    color = TextDark,
                    textAlign = TextAlign.Center
                )
            }
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "$score / $total correct",
                    fontSize = 16.sp,
                    color = TextGray,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(4.dp))
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(
                            if (passed) Color(0xFF22C55E).copy(alpha = 0.12f)
                            else SecondaryCoral.copy(alpha = 0.12f)
                        )
                        .padding(horizontal = 20.dp, vertical = 10.dp)
                ) {
                    Text(
                        text = "$percent%  •  ${if (passed) "Passed ✓" else "Failed ✗"}",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (passed) Color(0xFF22C55E) else SecondaryCoral,
                        textAlign = TextAlign.Center
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                contentPadding = PaddingValues(),
                shape = RoundedCornerShape(14.dp)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(VibrantGradient, RoundedCornerShape(14.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("View Results", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                }
            }
        }
    )
}

// ── Preview ───────────────────────────────────────────────────────────────────
@Preview(showBackground = true, device = "id:pixel_7_pro")
@Composable
fun QuizTestScreenPreview() {
    QuizTestScreen()
}
