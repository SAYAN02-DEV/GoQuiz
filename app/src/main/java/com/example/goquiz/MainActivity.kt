package com.example.goquiz

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// 1. Define the custom colors from your Tailwind HTML
val PrimaryOrange = Color(0xFFF27F0D)
val SecondaryCoral = Color(0xFFFF6B6B)
val BackgroundLight = Color(0xFFF8F7F5)
val TextDark = Color(0xFF1E293B)
val TextGray = Color(0xFF64748B)

// The vibrant gradient used throughout your design
val VibrantGradient = Brush.linearGradient(
    colors = listOf(PrimaryOrange, SecondaryCoral)
)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            // Apply our custom screen
            WelcomeScreen()
        }
    }
}

@Composable
fun WelcomeScreen() {
    // The main container (like the <body> tag)
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundLight)
            .windowInsetsPadding(WindowInsets.safeDrawing)
    ) {
        // Header
        TopHeader()

        // Main scrollable content area (Hero Image + Texts + Buttons)
        Column(
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            HeroImageSection()

            Spacer(modifier = Modifier.height(32.dp))

            // Headings
            Text(
                text = "Learn Smarter with",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = TextDark,
                textAlign = TextAlign.Center
            )
            // Gradient Text for "AI Quizzes"
            Text(
                text = "AI Quizzes",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                style = TextStyle(brush = VibrantGradient),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Subtitle
            Text(
                text = "Master any subject with personalized quizzes designed just for your learning style.",
                fontSize = 16.sp,
                color = TextGray,
                textAlign = TextAlign.Center,
                lineHeight = 24.sp
            )

            Spacer(modifier = Modifier.height(32.dp))

            // Action Buttons
            ActionButtons()
        }

        // Bottom Navigation Bar
        BottomNav()
    }
}

@Composable
fun TopHeader() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 24.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Logo and Title
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(VibrantGradient, RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Rounded.Star, contentDescription = "Logo", tint = Color.White)
            }
            Text("AI Learning", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = TextDark)
        }

        // Translate Icon
        Icon(Icons.Rounded.Search, contentDescription = "Search", tint = PrimaryOrange)
    }
}

@Composable
fun HeroImageSection() {
    // The relative container for the image and floating badges
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(1f) // Makes it a perfect square
    ) {
        // Background subtle gradient box
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(VibrantGradient, alpha = 0.1f)
                .clip(RoundedCornerShape(24.dp))
        )

        // Placeholder for the actual image.
        // (In a real app, you'd use the 'Coil' library to load the URL here)
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
                .background(Color.White, RoundedCornerShape(16.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                Icons.Rounded.Face,
                contentDescription = "Student",
                modifier = Modifier.size(100.dp),
                tint = PrimaryOrange.copy(alpha = 0.5f)
            )
        }

        // Floating Lightbulb Icon (Top Right)
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(top = 16.dp, end = 16.dp)
                .background(Color.White, RoundedCornerShape(8.dp))
                .padding(8.dp)
        ) {
            // Lightbulb icon replacement: use a simple emoji Text to avoid unresolved icon references
            Text("💡", color = PrimaryOrange, fontSize = 18.sp)
        }

        // Floating "Personalized Path" Tag (Bottom Left)
        Box(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(bottom = 48.dp)
                .background(
                    color = SecondaryCoral,
                    shape = RoundedCornerShape(topEnd = 8.dp, bottomEnd = 8.dp)
                )
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
            Text("Personalized Path", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun ActionButtons() {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        // "Get Started" Gradient Button
        Button(
            onClick = { /* TODO: Navigate */ },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
            contentPadding = PaddingValues()
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(VibrantGradient, RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text("Get Started", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
        }

        // "Browse Quizzes" Outlined Button
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .clickable { /* TODO: Navigate */ },
            color = PrimaryOrange.copy(alpha = 0.1f),
            shape = RoundedCornerShape(12.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, PrimaryOrange.copy(alpha = 0.2f))
        ) {
            Box(contentAlignment = Alignment.Center) {
                Text("Browse Quizzes", color = PrimaryOrange, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
            }
        }
    }
}

@Composable
@Suppress("DEPRECATION")
fun BottomNav() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White)
            .padding(vertical = 12.dp, horizontal = 16.dp),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.CenterVertically
    ) {
        BottomNavItem(icon = Icons.Rounded.Home, label = "Home", isSelected = true)
        BottomNavItem(icon = Icons.Rounded.List, label = "Quizzes", isSelected = false)
        BottomNavItem(icon = Icons.Rounded.Person, label = "Profile", isSelected = false)
    }
}

@Composable
fun BottomNavItem(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, isSelected: Boolean) {
    val color = if (isSelected) PrimaryOrange else TextGray.copy(alpha = 0.5f)
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp),
        modifier = Modifier.clickable { /* TODO: Handle Click */ }
    ) {
        Icon(icon, contentDescription = label, tint = color)
        Text(label, fontSize = 12.sp, color = color, fontWeight = FontWeight.Medium)
    }
}

// This allows you to see the design in the Android Studio preview panel!
@Preview(showBackground = true, device = "id:pixel_7_pro")
@Composable
fun WelcomeScreenPreview() {
    WelcomeScreen()
}