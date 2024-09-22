<?php

namespace App\Enum;
use Filament\Support\Contracts\HasLabel;

enum QuestionTypeEnum: int implements HasLabel
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

    public static function getValues(): array
    {
        return [
            self::MULTIPLE_CHOICE->value => 'Questão de Múltipla Escolha',
            self::TEXT->value => 'Questão de Texto',
        ];
    }
}
