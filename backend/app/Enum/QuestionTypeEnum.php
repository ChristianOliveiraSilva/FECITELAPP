<?php

namespace App\Enum;

enum QuestionTypeEnum: int
{
    case MULTIPLE_CHOICE = 1;
    case TEXT = 2;

    public function getLabel(): string
    {
        return match ($this) {
            self::MULTIPLE_CHOICE => 'Questão de Múltipla Escolha',
            self::TEXT => 'Questão de Texto',
        };
    }
}
