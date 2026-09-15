<?php

session_start();

header("Cache-Control: no-store");

if (isset($_SESSION['id_persona'])) {
    echo "1";
} else {
    echo "0";
}
