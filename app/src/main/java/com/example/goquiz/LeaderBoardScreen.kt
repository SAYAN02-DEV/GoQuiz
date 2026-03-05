package com.example.goquiz

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
import androidx.compose.material.icons.automirrored.rounded.FormatListBulleted
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// ── Data ──────────────────────────────────────────────────────────────────────
data class LeaderEntry(
    val rank: Int,
    val name: String,
    val points: Int,
    val quizzesWon: Int,
    val initials: String,
    val avatarColor: Color = Color(0xFFCBD5E1)
)

private val sampleEntries = listOf(
    LeaderEntry(4,  "Elena Rodriguez", 2150, 12, "ER", Color(0xFFBAE6FD)),
    LeaderEntry(5,  "Marcus Smith",    1980,  8, "MS", Color(0xFFBBF7D0)),
    LeaderEntry(6,  "Chloe Wang",      1820, 15, "CW", Color(0xFFFED7AA)),
    LeaderEntry(7,  "David Miller",    1745, 10, "DM", Color(0xFFE9D5FF)),
)

// ── Screen ────────────────────────────────────────────────────────────────────
@Composable
fun LeaderBoardScreen(
    onBack: () -> Unit = {}
) {
    var selectedScope by remember { mutableStateOf("Global") }

    // Gold / Silver / Bronze accent colors
    val Gold   = Color(0xFFFBBF24)
    val Silver = Color(0xFF94A3B8)
    val Bronze = Color(0xFFFB923C)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundLight)
            .windowInsetsPadding(WindowInsets.safeDrawing)
    ) {
        // ── Scrollable body ───────────────────────────────────────────────
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                // padding bottom: user-rank bar (~80dp) + bottom-nav (~64dp)
                .padding(bottom = 148.dp)
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
                    text = "Leaderboard",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextDark,
                    modifier = Modifier.align(Alignment.Center)
                )
            }

            HorizontalDivider(color = PrimaryOrange.copy(alpha = 0.10f), thickness = 1.dp)

            Spacer(modifier = Modifier.height(12.dp))

            // ── Toggle Switch ─────────────────────────────────────────────
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(PrimaryOrange.copy(alpha = 0.06f))
                    .border(1.dp, PrimaryOrange.copy(alpha = 0.12f), RoundedCornerShape(12.dp))
                    .padding(6.dp)
            ) {
                Row(modifier = Modifier.fillMaxWidth()) {
                    listOf("Global", "Friends").forEach { scope ->
                        val isActive = scope == selectedScope
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(40.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isActive) Color.White else Color.Transparent)
                                .then(
                                    if (isActive) Modifier.shadow(2.dp, RoundedCornerShape(8.dp))
                                    else Modifier
                                )
                                .clickable { selectedScope = scope },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = scope,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (isActive) PrimaryOrange else TextGray
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ── Podium ────────────────────────────────────────────────────
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.Bottom
            ) {
                // 2nd Place
                PodiumItem(
                    modifier = Modifier.weight(1f),
                    name = "Sarah",
                    points = "2,840 pts",
                    rank = "2nd",
                    initials = "SA",
                    avatarSize = 64.dp,
                    avatarBorderColor = Silver,
                    avatarBgColor = Color(0xFFE2E8F0),
                    rankBgColor = Silver,
                    rankTextColor = Color(0xFF1E293B),
                    barHeight = 64.dp,
                    barColor = Color(0xFFF1F5F9),
                    barBorderColor = Color(0xFFCBD5E1),
                    showTrophy = false,
                    nameFontSize = 14,
                    pointsFontSize = 12
                )
                // 1st Place
                PodiumItem(
                    modifier = Modifier.weight(1f),
                    name = "Alex Chen",
                    points = "3,120 pts",
                    rank = "1st",
                    initials = "AC",
                    avatarSize = 80.dp,
                    avatarBorderColor = Gold,
                    avatarBgColor = Color(0xFFFEF3C7),
                    rankBgColor = Gold,
                    rankTextColor = Color(0xFF78350F),
                    barHeight = 96.dp,
                    barColor = PrimaryOrange.copy(alpha = 0.10f),
                    barBorderColor = PrimaryOrange.copy(alpha = 0.30f),
                    showTrophy = true,
                    nameFontSize = 15,
                    pointsFontSize = 14
                )
                // 3rd Place
                PodiumItem(
                    modifier = Modifier.weight(1f),
                    name = "Jordan",
                    points = "2,410 pts",
                    rank = "3rd",
                    initials = "JO",
                    avatarSize = 64.dp,
                    avatarBorderColor = Bronze.copy(alpha = 0.7f),
                    avatarBgColor = Color(0xFFFFEDD5),
                    rankBgColor = Bronze.copy(alpha = 0.80f),
                    rankTextColor = Color(0xFF431407),
                    barHeight = 48.dp,
                    barColor = Color(0xFFFFF7ED),
                    barBorderColor = Color(0xFFFED7AA),
                    showTrophy = false,
                    nameFontSize = 14,
                    pointsFontSize = 12
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // ── Rankings list ─────────────────────────────────────────────
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                Text(
                    text = "RANKINGS",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextGray,
                    letterSpacing = 2.sp,
                    modifier = Modifier.padding(start = 4.dp, bottom = 12.dp)
                )
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    sampleEntries.forEach { entry ->
                        RankingRow(entry = entry)
                    }
                }
            }
        }

        // ── User Current Rank sticky bar ──────────────────────────────────
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                // sits above the bottom nav
                .padding(bottom = 64.dp)
                .padding(horizontal = 16.dp, vertical = 8.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(VibrantGradient)
                .padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Rank number
                Text(
                    text = "42",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White,
                    modifier = Modifier.width(28.dp)
                )

                // Avatar circle
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .clip(CircleShape)
                        .border(2.dp, Color.White.copy(alpha = 0.4f), CircleShape)
                        .background(Color.White.copy(alpha = 0.25f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Rounded.Person,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(26.dp)
                    )
                }

                // Name + subtitle
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        "YOU (CURRENT RANK)",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        letterSpacing = 0.5.sp
                    )
                    Text(
                        "Keep going! You're in top 15%",
                        fontSize = 11.sp,
                        color = Color.White.copy(alpha = 0.80f)
                    )
                }

                // Points
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        "945",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                    Text(
                        "PTS",
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White.copy(alpha = 0.70f),
                        letterSpacing = 1.sp
                    )
                }
            }
        }

        // ── Bottom Navigation ─────────────────────────────────────────────
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .background(Color.White)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 10.dp, horizontal = 8.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                BottomNavItem(icon = Icons.Rounded.Home,                            label = "Home",    isSelected = false)
                BottomNavItem(icon = Icons.AutoMirrored.Rounded.FormatListBulleted, label = "Quiz",    isSelected = false)
                BottomNavItem(icon = Icons.Rounded.Star,                            label = "Ranking", isSelected = true)
                BottomNavItem(icon = Icons.Rounded.Person,                          label = "Profile", isSelected = false)
            }
        }
    }
}

// ── Podium Item ───────────────────────────────────────────────────────────────
@Composable
fun PodiumItem(
    modifier: Modifier = Modifier,
    name: String,
    points: String,
    rank: String,
    initials: String,
    avatarSize: Dp,
    avatarBorderColor: Color,
    avatarBgColor: Color,
    rankBgColor: Color,
    rankTextColor: Color,
    barHeight: Dp,
    barColor: Color,
    barBorderColor: Color,
    showTrophy: Boolean,
    nameFontSize: Int,
    pointsFontSize: Int
) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Trophy crown for 1st
        if (showTrophy) {
            Icon(
                Icons.Rounded.Star,
                contentDescription = null,
                tint = Color(0xFFFBBF24),
                modifier = Modifier.size(28.dp)
            )
            Spacer(modifier = Modifier.height(4.dp))
        } else {
            Spacer(modifier = Modifier.height(32.dp))
        }

        // Avatar + rank badge
        Box(contentAlignment = Alignment.BottomCenter) {
            Box(
                modifier = Modifier
                    .size(avatarSize)
                    .clip(CircleShape)
                    .border(4.dp, avatarBorderColor, CircleShape)
                    .background(avatarBgColor),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = initials,
                    fontSize = (avatarSize.value * 0.22f).sp,
                    fontWeight = FontWeight.Bold,
                    color = TextDark
                )
            }
            // Rank badge
            Box(
                modifier = Modifier
                    .offset(y = 10.dp)
                    .clip(RoundedCornerShape(50))
                    .background(rankBgColor)
                    .border(1.5.dp, Color.White, RoundedCornerShape(50))
                    .padding(horizontal = 8.dp, vertical = 3.dp)
            ) {
                Text(
                    text = rank,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = rankTextColor
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = name,
            fontSize = nameFontSize.sp,
            fontWeight = FontWeight.Bold,
            color = TextDark,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            textAlign = TextAlign.Center
        )
        Text(
            text = points,
            fontSize = pointsFontSize.sp,
            fontWeight = FontWeight.SemiBold,
            color = PrimaryOrange
        )

        // Stepped bar
        Spacer(modifier = Modifier.height(8.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(barHeight)
                .clip(RoundedCornerShape(topStart = 10.dp, topEnd = 10.dp))
                .background(barColor)
                .border(
                    width = 1.dp,
                    color = barBorderColor,
                    shape = RoundedCornerShape(topStart = 10.dp, topEnd = 10.dp)
                )
        )
    }
}

// ── Ranking Row ───────────────────────────────────────────────────────────────
@Composable
fun RankingRow(entry: LeaderEntry) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Rank number
            Text(
                text = "${entry.rank}",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = TextGray,
                modifier = Modifier.width(20.dp),
                textAlign = TextAlign.Center
            )

            // Avatar
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(entry.avatarColor),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = entry.initials,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextDark
                )
            }

            // Name + quizzes
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = entry.name,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextDark
                )
                Text(
                    text = "${entry.quizzesWon} Quizzes won",
                    fontSize = 12.sp,
                    color = TextGray
                )
            }

            // Points
            Text(
                text = "${entry.points}",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = TextDark
            )
        }
    }
}

// ── Preview ───────────────────────────────────────────────────────────────────
@Preview(showBackground = true, device = "id:pixel_7_pro")
@Composable
fun LeaderBoardScreenPreview() {
    LeaderBoardScreen()
}
