package com.example.goquiz

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import java.util.Calendar
import java.text.SimpleDateFormat
import androidx.compose.material.icons.rounded.Notifications
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import java.util.Locale
class StudentHome : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            StudentHomeScreen()
        }
    }
}

@Composable
fun StudentHomeScreen() {
    val calendar = Calendar.getInstance()
    val formatter = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
    val current = formatter.format(calendar.time)
    val wishString = when {
        current < "12:00:00" -> "Good Morning"
        current < "18:00:00" -> "Good Afternoon"
        else -> "Good Evening"
    }
    val user = "John Doe"

    Column {
        // Row for header welcoming the user
        Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 24.dp),
        horizontalArrangement = Arrangement.Start,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .background(VibrantGradient, RoundedCornerShape(8.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Rounded.Star, contentDescription = "Logo", tint = Color.White)
        }
        Text(
            text = "$wishString, " +
                    "\n$user!",
            style = TextStyle(brush = VibrantGradient),
            color = TextGray,
            modifier = Modifier.weight(1f).padding(horizontal = 8.dp)
        )
        Box(
            modifier = Modifier
                .size(40.dp)
                .background(VibrantGradient, RoundedCornerShape(8.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Rounded.Notifications, contentDescription = "Notifications", tint = Color.White)
        }

    }
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 24.dp),
        horizontalArrangement = Arrangement.Start,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "$wishString, " +
                    "\n$user!",
//            style = TextStyle(brush = VibrantGradient),
            color = Color.Black,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.weight(1f).padding(horizontal = 8.dp)
        )
        }
    } // end Column
}

@Preview(showBackground = true)
@Composable
fun StudentHomeScreenPreview() {
    StudentHomeScreen()
}
