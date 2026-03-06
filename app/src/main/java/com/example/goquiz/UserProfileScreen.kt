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
import androidx.compose.material.icons.automirrored.rounded.Assignment
import androidx.compose.material.icons.automirrored.rounded.FormatListBulleted
import androidx.compose.material.icons.automirrored.rounded.Logout
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// ── Activity ──────────────────────────────────────────────────────────────────
class UserProfileActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            UserProfileScreen(
                onBack = { finish() },
                onShare = { /* TODO: Share profile */ },
                onNavigateToHome = {
                    startActivity(Intent(this, StudentHome::class.java))
                    finish()
                },
                onNavigateToQuizzes = {
                    startActivity(Intent(this, QuizzesActivity::class.java))
                }
            )
        }
    }
}

// ── Screen ────────────────────────────────────────────────────────────────────
@Composable
fun UserProfileScreen(
    onBack: () -> Unit = {},
    onShare: () -> Unit = {},
    onNavigateToHome: () -> Unit = {},
    onNavigateToQuizzes: () -> Unit = {}
) {
    var selectedTab by remember { mutableStateOf("My Insights") }
    var notificationsEnabled by remember { mutableStateOf(true) }

    // Bar chart data: fraction of max height, highlight = true means full orange
    val barData = listOf(
        0.40f to false,
        0.60f to false,
        0.90f to true,   // Wednesday — highlighted
        0.50f to false,
        0.30f to false,
        0.75f to true,   // Saturday — highlighted
        0.45f to false
    )
    val dayLabels = listOf("M", "T", "W", "T", "F", "S", "S")

    val topicMastery = listOf(
        Triple("Biology", 0.92f, "92%"),
        Triple("Physics", 0.78f, "78%"),
        Triple("Mathematics", 0.65f, "65%")
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

            // ── Top Bar ───────────────────────────────────────────────────
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(BackgroundLight.copy(alpha = 0.92f))
                    .padding(horizontal = 16.dp, vertical = 12.dp)
            ) {
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
                Text(
                    "Profile",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextDark,
                    modifier = Modifier.align(Alignment.Center)
                )
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

            HorizontalDivider(color = PrimaryOrange.copy(alpha = 0.10f), thickness = 1.dp)

            // ── Profile Hero ──────────────────────────────────────────────
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Avatar with PRO badge
                Box(contentAlignment = Alignment.BottomEnd) {
                    Box(
                        modifier = Modifier
                            .size(112.dp)
                            .clip(CircleShape)
                            .border(4.dp, PrimaryOrange, CircleShape)
                            .background(PrimaryOrange.copy(alpha = 0.12f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Rounded.Person,
                            contentDescription = null,
                            tint = PrimaryOrange,
                            modifier = Modifier.size(64.dp)
                        )
                    }
                    // PRO badge
                    Box(
                        modifier = Modifier
                            .offset(x = (-4).dp, y = (-4).dp)
                            .clip(CircleShape)
                            .background(PrimaryOrange)
                            .border(2.dp, BackgroundLight, CircleShape)
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            "PRO",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White,
                            letterSpacing = 0.5.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    "Sayan Manna",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextDark,
                    textAlign = TextAlign.Center
                )
                Text(
                    "Aspiring Data Scientist  •  Level 12",
                    fontSize = 13.sp,
                    color = TextGray,
                    fontWeight = FontWeight.Medium,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Edit Profile button
                Surface(
                    modifier = Modifier.clickable { },
                    shape = RoundedCornerShape(12.dp),
                    color = PrimaryOrange.copy(alpha = 0.10f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, PrimaryOrange.copy(alpha = 0.25f))
                ) {
                    Text(
                        "Edit Profile",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = PrimaryOrange,
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 9.dp)
                    )
                }
            }

            // ── Tab Toggle ────────────────────────────────────────────────
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(PrimaryOrange.copy(alpha = 0.06f))
                    .border(1.dp, PrimaryOrange.copy(alpha = 0.12f), RoundedCornerShape(12.dp))
                    .padding(5.dp)
            ) {
                Row(modifier = Modifier.fillMaxWidth()) {
                    listOf("My Insights", "Activity").forEach { tab ->
                        val isActive = tab == selectedTab
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(38.dp)
                                .clip(RoundedCornerShape(9.dp))
                                .background(if (isActive) Color.White else Color.Transparent)
                                .clickable { selectedTab = tab },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                tab,
                                fontSize = 13.sp,
                                fontWeight = if (isActive) FontWeight.Bold else FontWeight.Medium,
                                color = if (isActive) PrimaryOrange else TextGray
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // ── Insights ──────────────────────────────────────────────────
            if (selectedTab == "My Insights") {

                // ── Stat Cards (3-col grid) ───────────────────────────────
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    ProfileStatCard(modifier = Modifier.weight(1f), label = "Quizzes", value = "128", delta = "+12%", deltaPositive = true)
                    ProfileStatCard(modifier = Modifier.weight(1f), label = "Avg Score", value = "85%", delta = "+5%", deltaPositive = true)
                    ProfileStatCard(modifier = Modifier.weight(1f), label = "Rank", value = "1.2k", delta = "-2%", deltaPositive = false)
                }

                Spacer(modifier = Modifier.height(16.dp))

                // ── Learning Progress Bar Chart ───────────────────────────
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Learning Progress", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextDark)
                            Text("LAST 7 DAYS", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = TextGray, letterSpacing = 1.sp)
                        }
                        Spacer(modifier = Modifier.height(20.dp))
                        // Bars
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(96.dp),
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalAlignment = Alignment.Bottom
                        ) {
                            barData.forEachIndexed { _, (fraction, highlight) ->
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .fillMaxHeight(fraction)
                                        .clip(RoundedCornerShape(topStart = 5.dp, topEnd = 5.dp))
                                        .background(if (highlight) PrimaryOrange else PrimaryOrange.copy(alpha = 0.20f))
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        // Day labels
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            dayLabels.forEachIndexed { idx, label ->
                                val (_, highlight) = barData[idx]
                                Text(
                                    label,
                                    modifier = Modifier.weight(1f),
                                    textAlign = TextAlign.Center,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = if (highlight) PrimaryOrange else TextGray
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // ── Topic Mastery ─────────────────────────────────────────
                Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                    Text("Topic Mastery", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextDark, modifier = Modifier.padding(start = 4.dp, bottom = 12.dp))
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(20.dp),
                            verticalArrangement = Arrangement.spacedBy(18.dp)
                        ) {
                            topicMastery.forEach { (subject, fraction, label) ->
                                TopicMasteryRow(subject = subject, fraction = fraction, label = label)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(28.dp))
            } else {
                // ── Activity placeholder ──────────────────────────────────
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                        .padding(horizontal = 16.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color.White),
                    contentAlignment = Alignment.Center
                ) {
                    Text("Activity coming soon", color = TextGray, fontSize = 14.sp)
                }
                Spacer(modifier = Modifier.height(28.dp))
            }

            // ── Settings ──────────────────────────────────────────────────
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                Text("Settings", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextDark, modifier = Modifier.padding(start = 4.dp, bottom = 16.dp))

                // ACCOUNT group
                SettingsGroup(title = "ACCOUNT") {
                    SettingsRow(icon = Icons.Rounded.Person, label = "Edit Profile", trailingType = SettingsTrailing.Chevron)
                    HorizontalDivider(color = Color(0xFFF1F5F9), thickness = 1.dp)
                    SettingsRow(icon = Icons.Rounded.Lock, label = "Change Password", trailingType = SettingsTrailing.Chevron)
                }

                Spacer(modifier = Modifier.height(16.dp))

                // PREFERENCES group
                SettingsGroup(title = "PREFERENCES") {
                    SettingsRow(
                        icon = Icons.Rounded.Notifications,
                        label = "Push Notifications",
                        trailingType = SettingsTrailing.Toggle,
                        toggleChecked = notificationsEnabled,
                        onToggle = { notificationsEnabled = it }
                    )
                    HorizontalDivider(color = Color(0xFFF1F5F9), thickness = 1.dp)
                    SettingsRow(icon = Icons.Rounded.WbSunny, label = "Theme (Light/Dark)", trailingType = SettingsTrailing.Label, trailingLabel = "Light")
                    HorizontalDivider(color = Color(0xFFF1F5F9), thickness = 1.dp)
                    SettingsRow(icon = Icons.Rounded.Language, label = "Language", trailingType = SettingsTrailing.Label, trailingLabel = "English")
                }

                Spacer(modifier = Modifier.height(16.dp))

                // SUPPORT group
                SettingsGroup(title = "SUPPORT") {
                    SettingsRow(icon = Icons.Rounded.Info, label = "Help Center", trailingType = SettingsTrailing.Chevron)
                    HorizontalDivider(color = Color(0xFFF1F5F9), thickness = 1.dp)
                    SettingsRow(icon = Icons.Rounded.Policy, label = "Terms & Conditions", trailingType = SettingsTrailing.Chevron)
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Logout button
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .clickable { },
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFFFEF2F2)
                ) {
                    Row(
                        modifier = Modifier.fillMaxSize(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.AutoMirrored.Rounded.Logout, contentDescription = null, tint = Color(0xFFEF4444), modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Logout", color = Color(0xFFEF4444), fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }

        // ── Bottom Navigation ─────────────────────────────────────────────
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .background(Color.White)
        ) {
            HorizontalDivider(color = Color(0xFFF1F5F9), thickness = 1.dp)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 10.dp, horizontal = 8.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                BottomNavItem(icon = Icons.Rounded.Home,                            label = "Home",    isSelected = false, onClick = onNavigateToHome)
                BottomNavItem(icon = Icons.AutoMirrored.Rounded.FormatListBulleted, label = "Quizzes", isSelected = false, onClick = onNavigateToQuizzes)
                BottomNavItem(icon = Icons.Rounded.Person,                          label = "Profile", isSelected = true)
            }
        }
    }
}

// ── Profile Stat Card ─────────────────────────────────────────────────────────
@Composable
fun ProfileStatCard(
    modifier: Modifier = Modifier,
    label: String,
    value: String,
    delta: String,
    deltaPositive: Boolean
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Text(
                label.uppercase(),
                fontSize = 8.sp,
                fontWeight = FontWeight.Bold,
                color = TextGray,
                letterSpacing = 1.sp,
                textAlign = TextAlign.Center
            )
            Text(value, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TextDark, textAlign = TextAlign.Center)
            Text(
                delta,
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                color = if (deltaPositive) Color(0xFF22C55E) else Color(0xFFEF4444),
                textAlign = TextAlign.Center
            )
        }
    }
}

// ── Topic Mastery Row ─────────────────────────────────────────────────────────
@Composable
fun TopicMasteryRow(subject: String, fraction: Float, label: String) {
    val animFraction by animateFloatAsState(
        targetValue = fraction,
        animationSpec = tween(900),
        label = "mastery_$subject"
    )

    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(subject, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextDark)
            Text(label, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PrimaryOrange)
        }
        LinearProgressIndicator(
            progress = { animFraction },
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(CircleShape),
            color = PrimaryOrange,
            trackColor = PrimaryOrange.copy(alpha = 0.12f),
            strokeCap = StrokeCap.Round
        )
    }
}

// ── Settings Helpers ──────────────────────────────────────────────────────────
enum class SettingsTrailing { Chevron, Toggle, Label }

@Composable
fun SettingsGroup(title: String, content: @Composable ColumnScope.() -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            Text(
                title,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = TextGray,
                letterSpacing = 1.5.sp,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)
            )
            HorizontalDivider(color = Color(0xFFF8F7F5), thickness = 1.dp)
            content()
        }
    }
}

@Composable
fun SettingsRow(
    icon: ImageVector,
    label: String,
    trailingType: SettingsTrailing,
    trailingLabel: String = "",
    toggleChecked: Boolean = false,
    onToggle: (Boolean) -> Unit = {}
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(enabled = trailingType != SettingsTrailing.Toggle) { }
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Icon(icon, contentDescription = null, tint = TextGray, modifier = Modifier.size(22.dp))
        Text(label, fontSize = 14.sp, fontWeight = FontWeight.Medium, color = TextDark, modifier = Modifier.weight(1f))
        when (trailingType) {
            SettingsTrailing.Chevron ->
                Icon(Icons.AutoMirrored.Rounded.ArrowForward, contentDescription = null, tint = Color(0xFFCBD5E1), modifier = Modifier.size(18.dp))
            SettingsTrailing.Toggle ->
                Switch(
                    checked = toggleChecked,
                    onCheckedChange = onToggle,
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = PrimaryOrange,
                        uncheckedThumbColor = Color.White,
                        uncheckedTrackColor = Color(0xFFCBD5E1)
                    )
                )
            SettingsTrailing.Label ->
                Text(trailingLabel, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PrimaryOrange)
        }
    }
}

// ── Preview ───────────────────────────────────────────────────────────────────
@Preview(showBackground = true, device = "id:pixel_7_pro")
@Composable
fun UserProfileScreenPreview() {
    UserProfileScreen()
}
