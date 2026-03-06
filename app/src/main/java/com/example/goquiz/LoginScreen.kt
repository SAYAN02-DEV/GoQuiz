package com.example.goquiz

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// ── Colors (reuse from MainActivity if already defined, else local) ──────────
private val LoginPrimary = Color(0xFFF27F0D)
private val LoginBgLight = Color(0xFFF8F7F5)
private val LoginTextDark = Color(0xFF1E293B)
private val LoginTextGray = Color(0xFF64748B)
private val LoginSurface = Color(0xFFF1F5F9)
private val LoginBorder = Color(0xFFE2E8F0)
private val LoginDivider = Color(0xFFCBD5E1)

// ── Activity ──────────────────────────────────────────────────────────────────
class LoginActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            LoginScreen(
                onLoginWithGoogle = { /* TODO: Google Auth */ },
                onLoginWithFacebook = { /* TODO: Facebook Auth */ },
                onEmailLogin = { _, _ ->
                    startActivity(Intent(this, StudentHome::class.java))
                    finish()
                },
                onCreateAccount = { /* TODO: Navigate to Register */ },
                onForgotPassword = { /* TODO: Navigate to Reset */ }
            )
        }
    }
}

@Composable
fun LoginScreen(
    onLoginWithGoogle: () -> Unit = {},
    onLoginWithFacebook: () -> Unit = {},
    onEmailLogin: (email: String, password: String) -> Unit = { _, _ -> },
    onCreateAccount: () -> Unit = {},
    onForgotPassword: () -> Unit = {}
) {
    var emailExpanded by remember { mutableStateOf(false) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var rememberMe by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(LoginBgLight)
    ) {
        // ── Decorative blurred circles (bottom-left & top-right) ────────────
        Box(
            modifier = Modifier
                .size(240.dp)
                .offset(x = (-80).dp, y = 0.dp)
                .align(Alignment.BottomStart)
                .blur(60.dp)
                .background(LoginPrimary.copy(alpha = 0.12f), CircleShape)
        )
        Box(
            modifier = Modifier
                .size(240.dp)
                .offset(x = 80.dp, y = 0.dp)
                .align(Alignment.TopEnd)
                .blur(60.dp)
                .background(LoginPrimary.copy(alpha = 0.12f), CircleShape)
        )

        // ── Main card ───────────────────────────────────────────────────────
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White)
                .windowInsetsPadding(WindowInsets.safeDrawing)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {

            // ── Header ─────────────────────────────────────────────────────
            Spacer(modifier = Modifier.height(64.dp))
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .background(LoginPrimary, RoundedCornerShape(16.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Rounded.Psychology,
                    contentDescription = "Logo",
                    tint = Color.White,
                    modifier = Modifier.size(36.dp)
                )
            }
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                text = "Welcome Back",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = LoginTextDark,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Join 50,000+ learners generating personalized study paths in seconds.",
                fontSize = 14.sp,
                color = LoginTextGray,
                textAlign = TextAlign.Center,
                lineHeight = 20.sp,
                modifier = Modifier.padding(horizontal = 32.dp)
            )

            // ── Social Login Buttons ────────────────────────────────────────
            Spacer(modifier = Modifier.height(40.dp))
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 32.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Google Button
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(60.dp)
                        .clickable { onLoginWithGoogle() },
                    shape = RoundedCornerShape(16.dp),
                    color = LoginSurface,
                    border = androidx.compose.foundation.BorderStroke(2.dp, LoginBorder)
                ) {
                    Row(
                        modifier = Modifier.fillMaxSize(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Google "G" icon using colored text
                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .background(Color.White, CircleShape)
                                .border(1.dp, LoginBorder, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "G",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF4285F4)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "Login with Google",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = LoginTextDark
                        )
                    }
                }

                // Facebook Button
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(60.dp)
                        .clickable { onLoginWithFacebook() },
                    shape = RoundedCornerShape(16.dp),
                    color = LoginSurface,
                    border = androidx.compose.foundation.BorderStroke(2.dp, LoginBorder)
                ) {
                    Row(
                        modifier = Modifier.fillMaxSize(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .background(Color(0xFF1877F2), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "f",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "Login with Facebook",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = LoginTextDark
                        )
                    }
                }

                // Create account link
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "Don't have an account? ",
                        fontSize = 14.sp,
                        color = LoginTextGray
                    )
                    Text(
                        text = "Create an account",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = LoginPrimary,
                        modifier = Modifier.clickable { onCreateAccount() }
                    )
                }
            }

            // ── OR Email Login (collapsible) ────────────────────────────────
            Spacer(modifier = Modifier.height(24.dp))
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 32.dp)
            ) {
                // Divider with "or email login" label
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { emailExpanded = !emailExpanded },
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    HorizontalDivider(
                        modifier = Modifier.weight(1f),
                        color = LoginDivider,
                        thickness = 1.dp
                    )
                    Text(
                        text = "  or email login  ",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = LoginTextGray,
                        letterSpacing = 1.5.sp
                    )
                    HorizontalDivider(
                        modifier = Modifier.weight(1f),
                        color = LoginDivider,
                        thickness = 1.dp
                    )
                }

                // Animated email form
                AnimatedVisibility(
                    visible = emailExpanded,
                    enter = expandVertically() + fadeIn(),
                    exit = shrinkVertically() + fadeOut()
                ) {
                    Column(
                        modifier = Modifier.padding(top = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Email field
                        OutlinedTextField(
                            value = email,
                            onValueChange = { email = it },
                            modifier = Modifier.fillMaxWidth(),
                            placeholder = {
                                Text("Email Address", color = LoginTextGray, fontSize = 14.sp)
                            },
                            leadingIcon = {
                                Icon(
                                    Icons.Rounded.MailOutline,
                                    contentDescription = null,
                                    tint = LoginTextGray
                                )
                            },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = LoginPrimary,
                                unfocusedBorderColor = Color.Transparent,
                                focusedContainerColor = LoginSurface,
                                unfocusedContainerColor = LoginSurface
                            )
                        )

                        // Password field
                        OutlinedTextField(
                            value = password,
                            onValueChange = { password = it },
                            modifier = Modifier.fillMaxWidth(),
                            placeholder = {
                                Text("Password", color = LoginTextGray, fontSize = 14.sp)
                            },
                            leadingIcon = {
                                Icon(
                                    Icons.Rounded.LockOpen,
                                    contentDescription = null,
                                    tint = LoginTextGray
                                )
                            },
                            trailingIcon = {
                                IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                    Icon(
                                        imageVector = if (passwordVisible)
                                            Icons.Rounded.Visibility
                                        else
                                            Icons.Rounded.VisibilityOff,
                                        contentDescription = "Toggle password",
                                        tint = LoginTextGray
                                    )
                                }
                            },
                            visualTransformation = if (passwordVisible)
                                VisualTransformation.None
                            else
                                PasswordVisualTransformation(),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = LoginPrimary,
                                unfocusedBorderColor = Color.Transparent,
                                focusedContainerColor = LoginSurface,
                                unfocusedContainerColor = LoginSurface
                            )
                        )

                        // Remember me + Forgot password row
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.clickable { rememberMe = !rememberMe }
                            ) {
                                Checkbox(
                                    checked = rememberMe,
                                    onCheckedChange = { rememberMe = it },
                                    colors = CheckboxDefaults.colors(
                                        checkedColor = LoginPrimary,
                                        uncheckedColor = LoginDivider
                                    ),
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Stay logged in",
                                    fontSize = 12.sp,
                                    color = LoginTextGray
                                )
                            }
                            Text(
                                text = "Forgot password?",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = LoginPrimary,
                                modifier = Modifier.clickable { onForgotPassword() }
                            )
                        }

                        // Login button
                        Button(
                            onClick = { onEmailLogin(email, password) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(56.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = LoginPrimary)
                        ) {
                            Text(
                                text = "Login to Dashboard",
                                color = Color.White,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 16.sp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Icon(
                                Icons.AutoMirrored.Rounded.ArrowForward,
                                contentDescription = null,
                                tint = Color.White
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(48.dp))
        }
    }
}

@Preview(showBackground = true, device = "id:pixel_7_pro")
@Composable
fun LoginScreenPreview() {
    LoginScreen()
}
